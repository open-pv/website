import React, { useState } from "react";
import Slider from "../Template/Slider";

const EnableLaserPointsSlider = () => {
  const [enableLaserPoints, setEnableLaserPoints] = useState(1);
  window.enableLaserPoints = enableLaserPoints;

  const handleEnableLaserPointsChange = (newValue) => {
    let enableLaserPointsNew = newValue;
    setEnableLaserPoints(enableLaserPointsNew);
    window.enableLaserPoints = enableLaserPoints;
  };

  return (
    <div>
      <div>
        Laserpunktdaten einbeziehen: {enableLaserPoints == 0 ? "nein" : "ja"}
      </div>
      <Slider
        value={enableLaserPoints}
        onChange={handleEnableLaserPointsChange}
        min={0}
        max={1}
      />
    </div>
  );
};

export default EnableLaserPointsSlider;
