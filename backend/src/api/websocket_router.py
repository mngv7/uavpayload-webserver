from flask import Blueprint, request
import asyncio
from src.services.websocket_service import connect_to_payload

ws_bp = Blueprint('ws', __name__)

loop = None

def set_loop(event_loop):
    global loop
    loop = event_loop

@ws_bp.route('/connect', methods=['POST'])
def connect():
    data = request.get_json()
    server_address = data.get('serverAddress')
    socket_number = data.get('socketNumber')

    try:
        asyncio.run_coroutine_threadsafe(connect_to_payload(server_address, socket_number), loop)
        return {"message": "WebSocket connection started."}, 200
    except Exception as e:
        print("WebSocket error: ", e)
        return {"error": str(e)}, 500
