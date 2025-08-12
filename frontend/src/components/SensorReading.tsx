import '../assets/SensorReading.css'
import SensorGauge from "./SensorGauge";
import SensorGraph from './SensorGraph';

interface Params {
  sensorType: string;
  sensorReading: number;
  gaugeUpper: number;
  gaugeLower: number;
}

function SensorReading({ sensorType, sensorReading, gaugeUpper, gaugeLower }: Params) {
  return (
    <div className="sensor-reading-container">
        <h1>{sensorType}</h1>
        <div className='gauge-and-graph'>
            <div className='gauge'>
                <SensorGauge sensorReading={sensorReading} gaugeUpper={gaugeUpper} gaugeLower={gaugeLower}/>
            </div>
            <div>
            <SensorGraph />

            </div>
        </div>
    </div>
  );
}

export default SensorReading;
