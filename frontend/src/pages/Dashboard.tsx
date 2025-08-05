import React, { useState, useEffect } from 'react';
import '../assets/Dashboard.css';
import { FaTemperatureHigh, FaCloud, FaTint, FaWind, FaLightbulb, FaMapMarkerAlt, FaTools } from 'react-icons/fa';

// Define the shape of the sensor data
interface SensorData {
  timestamp: string;
  temperature: number;
  co2: number;
  humidity: number;
  pressure: number;
  light: number;
  longitude: string;
  latitude: string;
  altitude: string;
  dx: string;
  dy: string;
  dz: string;
  drill_status: string;
}

function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    timestamp: '',
    temperature: 0,
    co2: 0,
    humidity: 0,
    pressure: 0,
    light: 0,
    longitude: '0.0',
    latitude: '0.0',
    altitude: '0.0',
    dx: '0.0',
    dy: '0.0',
    dz: '0.0',
    drill_status: 'OFF'
  });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSensorData(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">UAV Monitoring Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Temperature Card */}
        <div className="bg-blue-100 p-4 rounded-lg shadow-md flex items-center">
          <h3 className="text-lg font-semibold text-blue-800"><FaTemperatureHigh className="inline-block align-text-bottom mr-2" />Temperature:</h3>
          <p className="text-lg font-bold text-blue-600 ml-auto">{sensorData.temperature} °C</p>
        </div>

        {/* CO2 Card */}
        <div className="bg-green-100 p-4 rounded-lg shadow-md flex items-center">
          <h3 className="text-lg font-semibold text-green-800"><FaCloud className="inline-block align-text-bottom mr-2" />CO2:</h3>
          <p className="text-lg font-bold text-green-600 ml-auto">{sensorData.co2} ppm</p>
        </div>

        {/* Humidity Card */}
        <div className="bg-teal-100 p-4 rounded-lg shadow-md flex items-center">
          <h3 className="text-lg font-semibold text-teal-800"><FaTint className="inline-block align-text-bottom mr-2" />Humidity:</h3>
          <p className="text-lg font-bold text-teal-600 ml-auto">{sensorData.humidity} %</p>
        </div>

        {/* Air Pressure Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex items-center">
          <h3 className="text-lg font-semibold text-purple-800"><FaWind className="inline-block align-text-bottom mr-2" />Air Pressure:</h3>
          <p className="text-lg font-bold text-purple-600 ml-auto">{sensorData.pressure} hPa</p>
        </div>

        {/* Light Intensity Card */}
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md flex items-center">
          <h3 className="text-lg font-semibold text-yellow-800"><FaLightbulb className="inline-block align-text-bottom mr-2" />Light Intensity:</h3>
          <p className="text-lg font-bold text-yellow-600 ml-auto">{sensorData.light} lx</p>
        </div>

        {/* Position Card */}
        <div className="bg-indigo-100 p-4 rounded-lg shadow-md flex flex-col items-start">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2"><FaMapMarkerAlt className="inline-block align-text-bottom mr-2" />Position:</h3>
          <div className="w-full text-sm font-bold text-indigo-600 grid grid-cols-3 gap-x-4 gap-y-1">
            <span>Lon: {sensorData.longitude}°</span>
            <span>Lat: {sensorData.latitude}°</span>
            <span>Alt: {sensorData.altitude} m</span>
            <span>dx: {sensorData.dx} m</span>
            <span>dy: {sensorData.dy} m</span>
            <span>dz: {sensorData.dz} m</span>
          </div>
        </div>

        {/* Drill Status Card */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-md flex items-center">
          <h3 className="text-lg font-semibold text-gray-800"><FaTools className="inline-block align-text-bottom mr-2" />Drill Status:</h3>
          <div className="ml-auto flex items-center">
            <span className={`w-5 h-5 rounded-full ${sensorData.drill_status === 'ON' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <p className="ml-2 text-lg font-bold">{sensorData.drill_status}</p>
          </div>
        </div>

      </div>
      <div className="mt-4 text-gray-600">
        Last Update: {sensorData.timestamp || 'Waiting for data...'}
      </div>
    </div>
  );
}

export default Dashboard;