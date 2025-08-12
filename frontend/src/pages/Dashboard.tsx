import SensorReading from "../components/SensorReading";
import '../assets/Dashboard.css';
import { useEffect, useState } from "react";
import { getSensorReadings } from "../services/api";

function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
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
        <SensorReading sensorType="Temperature" sensorReading={20} gaugeUpper={40} gaugeLower={0} />
        <SensorReading sensorType="Atmospheric Pressure" sensorReading={24} gaugeUpper={40} gaugeLower={0} />
        <SensorReading sensorType="Humidity" sensorReading={70} gaugeUpper={100} gaugeLower={0} />
        <SensorReading sensorType="Light" sensorReading={12} gaugeUpper={40} gaugeLower={0} />
        <SensorReading sensorType="Gas Sensors" sensorReading={35} gaugeUpper={40} gaugeLower={0} />
      </div>
    </div>
  );
}

export default Dashboard;
