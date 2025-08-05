# from flask import Flask, request
# from flask_cors import CORS
# import asyncio
# import websockets

# app = Flask(__name__)
# CORS(app)

# import threading

# loop = asyncio.new_event_loop()

# def start_loop(loop):
#     asyncio.set_event_loop(loop)
#     loop.run_forever()

# threading.Thread(target=start_loop, args=(loop,), daemon=True).start()

# @app.route('/connect', methods=['POST'])
# def connect():
#     data = request.get_json()
#     server_address = data.get('serverAddress')
#     socket_number = data.get('socketNumber')

#     try:
#         asyncio.run_coroutine_threadsafe(connectToPayload(server_address, socket_number), loop)
#         return {"message": "WebSocket connection started."}, 200
#     except Exception as e:
#         print("WebSocket error: ", e)
#         return {"error": str(e)}, 500

# async def connectToPayload(server_address, socket_number):
#     uri = f"ws://{server_address}:{socket_number}"
#     try:
#         async with websockets.connect(uri) as websocket:
#             print(f"[OPEN] Connected to {uri}")

#             async for message in websocket:
#                 print(f"[MESSAGE] {message}")

#     except websockets.exceptions.ConnectionClosedOK:
#         print("[CLOSE] Clean close")

#     except Exception as e:
#         print(f"[ERROR] {e}")

# def sendToFrontEnd(str):
#     pass

# if __name__ == '__main__':
#     app.run()