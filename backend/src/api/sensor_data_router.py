from flask import Blueprint
from src.services.sensor_data_service import get_sensor_data

sd_bp = Blueprint('sensor', __name__)

@sd_bp.route('/readings', methods=['GET'])
def get_sensor_readings():
    return get_sensor_data()

