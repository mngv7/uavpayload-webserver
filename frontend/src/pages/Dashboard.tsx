import React, { useState, useEffect } from 'react';
import '../assets/Dashboard.css';
import { FaTemperatureHigh, FaCloud, FaTint, FaWind, FaLightbulb, FaMapMarkerAlt, FaTools } from 'react-icons/fa';

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
    drill_status: 'OFF',
  });

  const [videoSrc, setVideoSrc] = useState<string>('');

  // resolve host/scheme so it works over http/https and localhost/LAN
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const scheme = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';

  // Sensor websocket (8765)
  useEffect(() => {
    const ws = new WebSocket(`ws://${host}:8765`);
    ws.onopen = () => console.log('Sensor WS connected');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setSensorData(data);
      } catch (e) {
        console.error('Sensor WS parse error:', e);
      }
    };
    ws.onerror = (err) => console.error('Sensor WS error:', err);
    ws.onclose = () => console.log('Sensor WS disconnected');
    return () => ws.close();
  }, [host]);

  // Video websocket (8766) — single, scheme-aware
  useEffect(() => {
    const url = `${scheme}://${host}:8766`;
    const vws = new WebSocket(url);
    vws.onopen = () => console.log('Video WS connected to', url);
    vws.onmessage = (event) => {
      setVideoSrc(`data:image/jpeg;base64,${event.data}`);
    };
    vws.onerror = (err) => console.error('Video WS error:', err);
    vws.onclose = () => console.log('Video WS disconnected');
    return () => vws.close();
  }, [host, scheme]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">UAV Monitoring Dashboard</h1>

        {/* Custom CSS grid -> 1 col on mobile, 3 cols (3/6/3) from 768px */}
        <div className="dashboard-grid">
          {/* Left: SENSOR CONTAINER */}
          <aside className="sensor-panel">
            <h2 className="panel-title">Sensors</h2>

            <div className="metric-row">
              <div className="metric-label"><FaTemperatureHigh className="mr-2" /> Temperature</div>
              <div className="metric-value">{sensorData.temperature} °C</div>
            </div>

            <div className="metric-row">
              <div className="metric-label"><FaCloud className="mr-2" /> CO2</div>
              <div className="metric-value">{sensorData.co2} ppm</div>
            </div>

            <div className="metric-row">
              <div className="metric-label"><FaTint className="mr-2" /> Humidity</div>
              <div className="metric-value">{sensorData.humidity} %</div>
            </div>

            <div className="metric-row">
              <div className="metric-label"><FaWind className="mr-2" /> Air Pressure</div>
              <div className="metric-value">{sensorData.pressure} hPa</div>
            </div>

            <div className="metric-row">
              <div className="metric-label"><FaLightbulb className="mr-2" /> Light</div>
              <div className="metric-value">{sensorData.light} lx</div>
            </div>

            <div className="metric-block">
              <div className="metric-label mb-2"><FaMapMarkerAlt className="mr-2" /> Position</div>
              <div className="metric-subrow">
                {/* <p>Lon: {sensorData.longitude}°</p>
                <p>Lat: {sensorData.latitude}°</p>
                <p>Alt: {sensorData.altitude} m</p> */}
                <p>dx: {sensorData.dx} m</p>
                <p>dy: {sensorData.dy} m</p>
                <p>dz: {sensorData.dz} m</p>
              </div>
            </div>

            <div className="metric-row">
              <div className="metric-label"><FaTools className="mr-2" /> Drill Status</div>
              <div className="metric-value">
                <span className={`dot ${sensorData.drill_status === 'ON' ? 'dot-on' : 'dot-off'}`} />
                <span className="ml-2 font-bold">{sensorData.drill_status}</span>
              </div>
            </div>

            <div className="last-update">Last Update: {sensorData.timestamp || 'Waiting for data...'}</div>
          </aside>

          {/* Centre: VIDEO (centred) */}
          <section className="video-column">
            <div className="video-box">
              {videoSrc ? (
                <img src={videoSrc} alt="Live feed" />
              ) : (
                <p className="text-white p-4">Waiting for video…</p>
              )}
            </div>
          </section>

          {/* Right: CONTROLS / LOGS */}
          <aside className="controls-panel">
            <h2 className="panel-title">Controls / Logs</h2>
            <p className="text-sm text-gray-600">Add charts, logs, or controls here.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
