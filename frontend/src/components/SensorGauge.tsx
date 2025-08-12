import GaugeComponent from "react-gauge-component";

interface Params {
  sensorReading: number;
  gaugeUpper: number;
  gaugeLower: number;
}


function SensorGauge({sensorReading, gaugeUpper, gaugeLower}: Params ) {
    return (
    <div>
        <GaugeComponent
            value={sensorReading}
            minValue={gaugeLower}
            maxValue={gaugeUpper}
            type="semicircle"
            arc={{
                colorArray: ["#00FF00", "#FF0000"],
                subArcs: [
                    { limit: gaugeUpper * 0.5, color: "#5BE12C" },
                    { limit: gaugeUpper * 0.75, color: "#F5CD19" },
                    { limit: gaugeUpper, color: "#EA4228" }
                ]
            }}
            labels={{
                valueLabel: { formatTextValue: value => `${value}` },
                tickLabels: { type: "inner" }
            }}
        />
    </div>
    )
}

export default SensorGauge;