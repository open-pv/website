import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Slider from "../Template/Slider"

const RadiusSlider = () => {
  const [numRadius, setNumRadius] = useState(30)
  window.numRadiusSimulation = numRadius
  const { t, i18n } = useTranslation()

  const handleRadiusChange = (newValue) => {
    setNumRadius(newValue);
    window.numRadiusSimulation = newValue;
    window.numRadiusSimulationChanged = true;
  };

  return (
    <div>
      <div>
        {t("radiusSlider.text")} {numRadius} m
      </div>
      <Slider
        value={numRadius}
        onChange={handleRadiusChange}
        min={0}
        max={100}
        stepSize={1}
      />
    </div>
  )
}

export default RadiusSlider
