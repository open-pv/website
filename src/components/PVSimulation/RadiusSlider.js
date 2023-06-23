import React, { useState } from 'react';
import Slider from '../Template/Slider';

const RadiusSlider = () => {
    const [numRadius, setNumRadius] = useState(30);
    window.numRadiusSimulation = numRadius;
  
    const handleNumSimulationsChange = (newValue) => {
      setNumRadius(newValue);
      window.numRadiusSimulation = newValue;
    };
  
    return (
      <div>
        <div>Radius Gebäude: {numRadius} m</div>
        <Slider 
            value={numRadius} 
            onChange={handleNumSimulationsChange} 
            min={0}
            max={100}
            stepSize={1}
        />
      </div>
    );
  }

export default RadiusSlider;
  
