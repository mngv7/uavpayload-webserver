from flask import Flask
from flask_cors import CORS
import asyncio
import threading

app = Flask(__name__)
CORS(app)

loop = asyncio.new_event_loop()

def start_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

threading.Thread(target=start_loop, args=(loop,), daemon=True).start()

from src.api.websocket_router import ws_bp, set_loop
set_loop(loop)

from src.api.sensor_data_router import sd_bp

app.register_blueprint(ws_bp, url_prefix='/ws')
app.register_blueprint(sd_bp, url_prefix='/sensor')

if __name__ == '__main__':
    print("hello")
    app.run()
