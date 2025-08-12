import asyncio
import websockets
import socket
import json
import threading
import os

# WebSocket server settings (override via env)
WS_HOST = os.getenv('SENSOR_WS_HOST', 'localhost')
WS_PORT = int(os.getenv('SENSOR_WS_PORT', '8765'))

# UDP server settings (override via env)
UDP_HOST = os.getenv('SENSOR_UDP_HOST', '127.0.0.1')
UDP_PORT = int(os.getenv('SENSOR_UDP_PORT', '6001'))

# Set of connected WebSocket clients
clients = set()

async def register(websocket):
    """Registers a new client, and removes it when disconnected."""
    clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}. Total clients: {len(clients)}")
    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(clients)}")

async def broadcast(message):
    """Broadcasts a message to all connected clients."""
    if clients:
        print(f"Broadcasting to {len(clients)} clients: {message}")
        # Use asyncio.gather to send messages to all clients concurrently
        await asyncio.gather(*[client.send(message) for client in clients])

def udp_listener(loop):
    """Listens for UDP data and schedules it to be broadcast."""
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_socket.bind((UDP_HOST, UDP_PORT))
    print(f"UDP server listening on {UDP_HOST}:{UDP_PORT}")
    while True:
        data, _ = udp_socket.recvfrom(65536)
        try:
            message = json.loads(data.decode('utf-8'))
            # Use run_coroutine_threadsafe to safely schedule the broadcast
            # on the main asyncio event loop from this thread.
            asyncio.run_coroutine_threadsafe(broadcast(json.dumps(message)), loop)
        except json.JSONDecodeError:
            print(f"Received non-JSON UDP data: {data}")

async def main():
    """Starts the UDP listener and the WebSocket server."""
    # Get the current running event loop
    loop = asyncio.get_running_loop()

    # Start the UDP listener in a separate thread, passing it the loop
    udp_thread = threading.Thread(target=udp_listener, args=(loop,), daemon=True)
    udp_thread.start()

    # Start the WebSocket server
    async with websockets.serve(register, WS_HOST, WS_PORT):
        print(f"WebSocket server started on ws://{WS_HOST}:{WS_PORT}")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Server shutting down.")
