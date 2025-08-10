# client_udp_receiver_chunked.py  (a.k.a. backend/stream_rcv.py)
import os
import time
import socket
import struct
import numpy as np
import cv2
from collections import deque
from inference import get_model

# --- WebSocket broadcaster (frames -> base64 JPEG over ws://:8766) ---
import asyncio
import websockets
import base64
import threading

WS_HOST = "0.0.0.0"
WS_PORT = 8766
_ws_clients = set()
_ws_loop = None  # will hold the running loop used by the WS server

async def _ws_handler(ws):
    _ws_clients.add(ws)
    try:
        async for _ in ws:  # we don't expect messages; keep alive
            pass
    finally:
        _ws_clients.discard(ws)

async def _ws_broadcast_b64(b64_jpg: str):
    if not _ws_clients:
        return
    await asyncio.gather(*(ws.send(b64_jpg) for ws in list(_ws_clients)), return_exceptions=True)

async def _ws_main():
    global _ws_loop
    _ws_loop = asyncio.get_running_loop()
    async with websockets.serve(_ws_handler, WS_HOST, WS_PORT, max_size=None):
        print(f"Video WebSocket server on ws://{WS_HOST}:{WS_PORT}")
        # run forever
        await asyncio.Future()

def _start_ws_server_thread():
    asyncio.run(_ws_main())

def send_frame_to_frontend(frame_bgr):
    """Encode BGR frame -> JPEG -> base64, schedule broadcast on WS loop."""
    if _ws_loop is None:
        return
    ok, buf = cv2.imencode(".jpg", frame_bgr, [cv2.IMWRITE_JPEG_QUALITY, 70])
    if not ok:
        return
    b64 = base64.b64encode(buf).decode("ascii")
    asyncio.run_coroutine_threadsafe(_ws_broadcast_b64(b64), _ws_loop)

# -------------------- Roboflow model --------------------
MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID", "guages-t6e81/4")
API_KEY  = os.getenv("ROBOFLOW_API_KEY", "9vpbvmbC7lEZ7Q36n4xD")
model = get_model(MODEL_ID, api_key=API_KEY)

# -------------------- Gauge mapping config --------------------
SWEEP_DEG = 300.0             # usable sweep from 0-ref (green) to full scale (deg)
FULL_SCALE_BAR = 10.0         # full-scale pressure (bar)
SMOOTH_ALPHA = 0.2            # 0..1 (higher = snappier)

angle_smooth = None
pressure_smooth = None

ANG_THRESHOLD_DEG = 14  # threshold to avoid jitter around 0-ref

# Angles from 0-ref -> tip
def compute_angles_from_zero(p_centre, p_zero, p_tip):
    """
    Returns (cw_deg, ccw_deg) from 0-ref to needle tip.
    Image coords: x right, y down => arctan2 angles increase clockwise.
    """
    c = np.array(p_centre, dtype=float)
    z = np.array(p_zero,   dtype=float)
    t = np.array(p_tip,    dtype=float)
    a0 = np.degrees(np.arctan2(z[1]-c[1], z[0]-c[0])) % 360.0
    at = np.degrees(np.arctan2(t[1]-c[1], t[0]-c[0])) % 360.0 + ANG_THRESHOLD_DEG
    cw  = (at - a0) % 360.0           # clockwise from zero -> tip
    ccw = (a0 - at) % 360.0           # = 360 - cw
    return cw, ccw

def to_pressure_bar(cw_angle_deg: float) -> float:
    # Clamp to usable sweep then map linearly to bar
    a = max(0.0, min(cw_angle_deg, SWEEP_DEG))
    return (a / SWEEP_DEG) * FULL_SCALE_BAR

def kp_label(k):
    return getattr(k, "class_name", None) or getattr(k, "label", None) or getattr(k, "name", None)

def canonicalise_label(lbl: str):
    if not lbl:
        return None
    l = lbl.strip().lower()
    if l in ("center", "centre"): return "centre"
    if l in ("0-ref", "0_ref", "zero", "0"): return "zero"
    if l in ("tip", "needle_tip"): return "tip"
    return None

# -------------------- UDP receive (chunked) --------------------
LISTEN_IP = "127.0.0.1"
LISTEN_PORT = 5000
BUFSIZE = 65536
HEADER_STRUCT = struct.Struct("!IHH")  # frame_id(uint32), total_chunks(uint16), chunk_idx(uint16)
SOCKET_TIMEOUT = 2.0

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 1 << 20)
s.bind((LISTEN_IP, LISTEN_PORT))
s.settimeout(SOCKET_TIMEOUT)
print(f"Client listening on {LISTEN_IP}:{LISTEN_PORT}")

# Start the video WS server in background
threading.Thread(target=_start_ws_server_thread, daemon=True).start()

frames = {}         # frame_id -> { 'total': int, 'chunks': dict[idx->bytes], 'first_ts': float }
order = deque()
MAX_INFLIGHT_FRAMES = 32
STALE_SECONDS = 2.0

recv_count, t0, recv_fps = 0, time.time(), 0.0

def purge_stale():
    now = time.time()
    while order:
        fid = order[0]
        meta = frames.get(fid)
        if not meta:
            order.popleft(); continue
        if (now - meta['first_ts']) > STALE_SECONDS:
            frames.pop(fid, None)
            order.popleft()
        else:
            break
    while len(frames) > MAX_INFLIGHT_FRAMES and order:
        fid = order.popleft()
        frames.pop(fid, None)

try:
    while True:
        try:
            packet, _ = s.recvfrom(BUFSIZE)
        except socket.timeout:
            purge_stale()
            continue

        if len(packet) < HEADER_STRUCT.size:
            continue

        frame_id, total_chunks, chunk_idx = HEADER_STRUCT.unpack_from(packet, 0)
        payload = packet[HEADER_STRUCT.size:]

        if frame_id not in frames:
            frames[frame_id] = {'total': total_chunks, 'chunks': {}, 'first_ts': time.time()}
            order.append(frame_id)

        frames[frame_id]['chunks'][chunk_idx] = payload

        # complete frame?
        meta = frames[frame_id]
        if len(meta['chunks']) == meta['total']:
            parts = [meta['chunks'][i] for i in range(meta['total'])]
            jpeg_bytes = b"".join(parts)
            frames.pop(frame_id, None)
            if order and order[0] == frame_id:
                order.popleft()

            frame = cv2.imdecode(np.frombuffer(jpeg_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
            if frame is None:
                continue

            # -------- Inference & overlay --------
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            try:
                resp_list = model.infer(rgb, confidence=0.3)
            except Exception as e:
                cv2.putText(frame, f"infer err: {e}", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                resp_list = []

            if resp_list:
                resp = resp_list[0]
                preds = resp.predictions
                if preds:
                    pred = max(preds, key=lambda p: p.confidence)

                    kpd = {}
                    for k in pred.keypoints:
                        nm = canonicalise_label(kp_label(k))
                        if nm:
                            kpd[nm] = (k.x, k.y, k.confidence)

                    if all(n in kpd for n in ("centre", "zero", "tip")):
                        centre = (kpd["centre"][0], kpd["centre"][1])
                        zero   = (kpd["zero"][0],   kpd["zero"][1])
                        tip    = (kpd["tip"][0],    kpd["tip"][1])

                        # draw points/arms
                        for p, col in [(centre, (0, 255, 255)), (zero, (0, 255, 0)), (tip, (0, 0, 255))]:
                            cv2.circle(frame, (int(p[0]), int(p[1])), 6, col, -1)
                        cv2.line(frame, tuple(map(int, centre)), tuple(map(int, zero)), (0, 255, 0), 2)
                        cv2.line(frame, tuple(map(int, centre)), tuple(map(int, tip)),  (0, 0, 255), 2)

                        # angles & pressure (DISPLAY = CW as requested)
                        cw_deg, ccw_deg = compute_angles_from_zero(centre, zero, tip)
                        angle_display_deg = cw_deg                 # display clockwise
                        pressure_bar = to_pressure_bar(cw_deg)     # map CW sweep to bar

                        # EMA smoothing
                        if angle_smooth is None:
                            angle_smooth = angle_display_deg
                            pressure_smooth = pressure_bar
                        else:
                            angle_smooth = (1 - SMOOTH_ALPHA) * angle_smooth + SMOOTH_ALPHA * angle_display_deg
                            pressure_smooth = (1 - SMOOTH_ALPHA) * pressure_smooth + SMOOTH_ALPHA * pressure_bar

                        cv2.putText(frame, f"Angle: {angle_smooth:6.2f} deg", (10, 90),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)
                        cv2.putText(frame, f"Pressure: {pressure_smooth:4.2f} bar", (10, 125),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)

                        # warn if CW angle outside usable sweep
                        if cw_deg > SWEEP_DEG + 3:
                            cv2.putText(frame, "Out of sweep", (10, 160),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                    else:
                        missing = [n for n in ("centre", "zero", "tip") if n not in kpd]
                        cv2.putText(frame, f"Missing KP(s): {', '.join(missing)}",
                                    (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                else:
                    cv2.putText(frame, "No gauge detected", (10, 90),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
            else:
                cv2.putText(frame, "No response from model", (10, 90),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

            # -------- FPS & display --------
            recv_count += 1
            dt = time.time() - t0
            if dt >= 1.0:
                recv_fps = recv_count / dt
                recv_count, t0 = 0, time.time()

            cv2.putText(frame, f"Received FPS: {recv_fps:.1f}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.imshow("Client (received)", frame)

            # --- push to frontend via WebSocket ---
            send_frame_to_frontend(frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        purge_stale()
finally:
    s.close()
    cv2.destroyAllWindows()
