import React, { useEffect, useRef } from 'react';
import { RadialGauge } from 'canvas-gauges';
import './gps.css';

const GaugeComponent = ({ id, value = 0, unit = '', min = 0, max = 100, width = 200, height = 200 }) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null);
//chnaging
  // Initialize the gauge only once on mount
  useEffect(() => {
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
      if (gaugeRef.current) {
        gaugeRef.current.destroy();
        gaugeRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the gauge when any of these props change
  useEffect(() => {
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
