import React, { useEffect, useRef } from 'react';
import { RadialGauge } from 'canvas-gauges';
import "./gps.css";

const GaugeComponent = ({ id, value = 0, unit = '', min = 0, max = 100, width = 200, height = 200 }) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null);

  useEffect(() => {
    // Initialize the gauge
    gaugeRef.current = new RadialGauge({
      renderTo: canvasRef.current,
      width,
      height,
      units: unit,
      minValue: min,
      maxValue: max,
      majorTicks: [min, max],
      minorTicks: 5,
      strokeTicks: true,
      highlights: [{ from: min, to: max, color: 'rgba(255,0,0,.3)' }],
      value,
      animation: { duration: 500 },
    });
    gaugeRef.current.draw();

    return () => {
      // Destroy the gauge when the component unmounts
      if (gaugeRef.current) {
        gaugeRef.current.destroy();
        gaugeRef.current = null;
      }
    };
  }, []); // Run only on mount and unmount

  useEffect(() => {
    // Update the gauge when props change
    if (gaugeRef.current) {
      gaugeRef.current.update({
        value,
        units: unit,
        minValue: min,
        maxValue: max,
        width,
        height,
      });
    }
  }, [value, unit, min, max, width, height]);

  return <canvas ref={canvasRef} id={id} data-testid="gauge-canvas" />;
};

export default GaugeComponent;