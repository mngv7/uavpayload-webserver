import asyncio
import websockets

async def connect_to_payload(server_address, socket_number):
    uri = f"ws://{server_address}:{socket_number}"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[OPEN] Connected to {uri}")

            async for message in websocket:
                print(f"[MESSAGE] {message}")

    except websockets.exceptions.ConnectionClosedOK:
        print("[CLOSE] Clean close")

    except Exception as e:
        print(f"[ERROR] {e}")
