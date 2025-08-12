UAV Payload Webserver

Overview
- Purpose: Receive video and sensor data over UDP and serve them to the frontend via WebSockets.
- Components:
  - `backend/stream_rcv.py`: Receives chunked JPEG frames over UDP and broadcasts frames over WebSocket.
  - `backend/sensor_rcv.py`: Receives JSON over UDP and broadcasts it over WebSocket.
  - `backend/main.py`: Convenience runner that launches both receivers together.
  - `backend/ws_controller.py` (optional): Flask API that can initiate outbound WebSocket client connections; not required for the main flow.

Backend
- Quick start:
  - Python 3.9+ recommended
  - Install deps (first time):
    - `python3 -m venv venv && source venv/bin/activate`
    - `pip install -r backend/requirements.txt`
  - Run both services:
    - `python backend/main.py`
  - Optional configuration via `.env` (repo root):
    - Copy `.env.example` to `.env` and edit values.

- What starts:
  - Sensors WS server on `ws://0.0.0.0:8765` (from `sensor_rcv.py`)
  - Video WS server on `ws://0.0.0.0:8766` (from `stream_rcv.py`)
  - Press Ctrl+C to stop; the runner will shut down both processes.

- UDP inputs (defaults in code):
  - Sensors: `127.0.0.1:6001` (expects JSON payloads)
  - Video: `127.0.0.1:5000` (expects chunked JPEG packets with header `!IHH`)

- Notes:
  - `backend/ws_controller.py` is not used by `backend/main.py`. It is a separate Flask app that can be extended to bridge a remote WebSocket source if needed.
  - `stream_rcv.py` shows a local OpenCV window and also pushes frames to the WebSocket; press `q` to close the window.
  - If you see an import error for `inference` in `stream_rcv.py`, ensure that dependency exists or remove/comment the unused import.

Configuration
- Override defaults via environment variables:
  - Sensors WS bind: `SENSOR_WS_HOST` (default `0.0.0.0`)
  - Sensors WS port: `SENSOR_WS_PORT` (default `8765`)
  - Sensors UDP bind: `SENSOR_UDP_HOST` (default `127.0.0.1`)
  - Sensors UDP port: `SENSOR_UDP_PORT` (default `6001`)
  - Video WS bind: `VIDEO_WS_HOST` (default `0.0.0.0`)
  - Video WS port: `VIDEO_WS_PORT` (default `8766`)
  - Video UDP bind: `VIDEO_UDP_HOST` (default `127.0.0.1`)
  - Video UDP port: `VIDEO_UDP_PORT` (default `5000`)

- Examples:
  - Listen on all interfaces for both WS servers and UDP inputs:
    - `SENSOR_WS_HOST=0.0.0.0 SENSOR_UDP_HOST=0.0.0.0 VIDEO_WS_HOST=0.0.0.0 VIDEO_UDP_HOST=0.0.0.0 python backend/main.py`
  - Custom ports (e.g., behind a reverse proxy):
    - `SENSOR_WS_PORT=9081 VIDEO_WS_PORT=9082 python backend/main.py`

Env loading
- `backend/main.py` auto-loads `.env` from the repo root (and `backend/.env` if present) before launching child processes, so the variables apply to both receivers.

Frontend
- Quick start:
  - `cd frontend`
  - `npm run dev`
  - (If it’s the first time: run `npm install` before `npm run dev`.)

- Default dev server: Vite (typically `http://localhost:5173`).
- The frontend should connect to these WebSockets:
  - Sensors: `ws://<host>:8765`
  - Video: `ws://<host>:8766`

Troubleshooting
- Address in use: Another process is using a port; stop it or change the port constants in the Python files.
- Missing packages: Activate the venv and reinstall `backend/requirements.txt`.
- Firewall: Ensure UDP ports 5000/6001 and WS ports 8765/8766 are accessible as needed.
