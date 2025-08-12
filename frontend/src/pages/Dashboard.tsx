import SensorReading from "../components/SensorReading";
import '../assets/Dashboard.css';

function Dashboard() {
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
