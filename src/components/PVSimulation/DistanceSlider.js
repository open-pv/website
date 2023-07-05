import React, { useState } from "react";
import Slider from "../Template/Slider";

const DistanceSlider = () => {
  const [numDistance, setNumDistance] = useState(0);
  window.numDistanceStep = numDistance;

  const handleDistanceChange = (newValue) => {
    setNumDistance(newValue);
    window.numDistanceStep = newValue;
  };

  return (
    <div>
      <div>Schrittweite auf Karte: {numDistance} m</div>
      <Slider
        value={numDistance}
        onChange={handleDistanceChange}
        min={0}
        max={100}
        stepSize={1}
      />
    </div>
  );
};

export default DistanceSlider;
