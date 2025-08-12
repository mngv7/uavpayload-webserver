import SensorReading from "../components/SensorReading";
import '../assets/Dashboard.css';
import { useEffect, useState } from "react";
import { getSensorReadings } from "../services/api";

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
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSensorReadings();
        setSensorData(data);
        setError(null);
      } catch (err) {
        setError(String(err));
      } 
    }

    fetchData();

    const intervalId = setInterval(fetchData, 4000);

    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return (
      <>
        <h1>Dashboard</h1>
        <h2>Error!</h2>   
        {error}
      </>
    )
  }

  if (!sensorData) {
    return (
      <>
        <h1>Dashboard</h1>
        <h2>Loading...</h2>
      </>
    )
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="gauges-cluster">
        <SensorReading sensorType="Temperature" sensorReading={sensorData.temperature} gaugeUpper={40} gaugeLower={0} />
        <SensorReading sensorType="Atmospheric Pressure" sensorReading={sensorData.pressure} gaugeUpper={40} gaugeLower={0} />
        <SensorReading sensorType="Humidity" sensorReading={sensorData.humidity} gaugeUpper={100} gaugeLower={0} />
        <SensorReading sensorType="Light" sensorReading={sensorData.light} gaugeUpper={40} gaugeLower={0} />
        <SensorReading sensorType="Gas Sensors" sensorReading={sensorData.co2} gaugeUpper={40} gaugeLower={0} />
      </div>
    </div>
  );
}

export default Dashboard;
