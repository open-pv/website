import React, { useState } from "react";
import Slider from "../Template/Slider";

const VisualizeLaserPointsSlider = () => {
  const [pointsVisualizationRatio, setPointsVisualizationRatio] = useState(0.5);
  window.pointsVisualizationRatio = pointsVisualizationRatio;

  const handlePointsVisualizationRatioChange = (newValue) => {
    let pointsVisualizationRatioNew = Math.pow(10, newValue);
    setPointsVisualizationRatio(pointsVisualizationRatioNew);
    window.pointsVisualizationRatio = pointsVisualizationRatio;
    window.pointsVisualizationRatioChanged = true;
  };

  return (
    <div>
      <div>
        Laserpunkt Visualisierungsverhältnis:{" "}
        {Math.floor(pointsVisualizationRatio * 100) / 100}
      </div>
      <Slider
        value={Math.log(pointsVisualizationRatio) / Math.log(10)}
        onChange={handlePointsVisualizationRatioChange}
        min={-2}
        max={0}
        stepSize={0.1}
      />
    </div>
  );
};

export default VisualizeLaserPointsSlider;
