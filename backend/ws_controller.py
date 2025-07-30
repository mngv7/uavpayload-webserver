from flask import Flask, request
from flask_cors import CORS
import asyncio
import websockets

app = Flask(__name__)
CORS(app)

@app.route('/connect', methods=['POST'])
def connect():
    data = request.get_json()
    server_address = data.get('serverAddress')
    socket_number = data.get('socketNumber')

    try:
        asyncio.run(connectToPayload(server_address, socket_number))
    except Exception as e:
        print("Websocket error: ", e)

    return "OK"

async def connectToPayload(server_address, socket_number):
    uri = f"ws://{server_address}:{socket_number}"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[OPEN] Connected to {uri}")

            async for message in websocket:
                print(f"[MESSAGE] {message}")

    except websockets.exceptions.ConnectionClosedOK:
        print("[CLOSE] Clean close")

    except websockets.exceptions.ConnectionClosedError as e:
        print(f"[CLOSE ERROR] {e}")

    except Exception as e:
        print(f"[ERROR] {e}")


if __name__ == '__main__':
    app.run()
