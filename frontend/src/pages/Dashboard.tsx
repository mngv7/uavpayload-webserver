import { useState, useEffect } from 'react';
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
    <div className="page-wrap">
      <section className="hero">
        <h1 className="hero-title">UAV Monitoring Dashboard</h1>
        <p className="hero-subtitle">Live telemetry, video feed, and system status.</p>
      </section>

      <div className="dashboard-grid">
        {/* Left: SENSOR CONTAINER */}
        <aside className="sensor-panel">
          <h2 className="panel-title">Sensors</h2>

          <div className="metric-row">
            <div className="metric-label"><FaTemperatureHigh style={{ marginRight: 8 }} /> Temperature</div>
            <div className="metric-value">{sensorData.temperature} °C</div>
          </div>

          <div className="metric-row">
            <div className="metric-label"><FaCloud style={{ marginRight: 8 }} /> CO2</div>
            <div className="metric-value">{sensorData.co2} ppm</div>
          </div>

          <div className="metric-row">
            <div className="metric-label"><FaTint style={{ marginRight: 8 }} /> Humidity</div>
            <div className="metric-value">{sensorData.humidity} %</div>
          </div>

          <div className="metric-row">
            <div className="metric-label"><FaWind style={{ marginRight: 8 }} /> Air Pressure</div>
            <div className="metric-value">{sensorData.pressure} hPa</div>
          </div>

          <div className="metric-row">
            <div className="metric-label"><FaLightbulb style={{ marginRight: 8 }} /> Light</div>
            <div className="metric-value">{sensorData.light} lx</div>
          </div>

          <div className="metric-block">
            <div className="metric-label" style={{ marginBottom: 8 }}><FaMapMarkerAlt style={{ marginRight: 8 }} /> Position</div>
            <div className="metric-subrow">
              <p>dx: {sensorData.dx} m</p>
              <p>dy: {sensorData.dy} m</p>
              <p>dz: {sensorData.dz} m</p>
            </div>
          </div>

          <div className="metric-row">
            <div className="metric-label"><FaTools style={{ marginRight: 8 }} /> Drill Status</div>
            <div className="metric-value">
              <span className={`dot ${sensorData.drill_status === 'ON' ? 'dot-on' : 'dot-off'}`} />
              <span style={{ marginLeft: 8, fontWeight: 700 }}>{sensorData.drill_status}</span>
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
              <p style={{ color: '#fff', padding: '1rem' }}>Waiting for video…</p>
            )}
          </div>
        </section>

        {/* Right: CONTROLS / LOGS */}
        <aside className="controls-panel">
          <h2 className="panel-title">Controls / Logs</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Add charts, logs, or controls here.</p>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
