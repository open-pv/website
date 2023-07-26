import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Slider from "../Template/Slider"

const DistanceSlider = () => {
  const [numDistance, setNumDistance] = useState(10)
  window.distanceStep = numDistance
  const { t, i18n } = useTranslation()

  const handleDistanceChange = (newValue) => {
    setNumDistance(newValue)
    window.distanceStep = newValue
  }

  return (
    <div>
      <div>
        {t("distanceSlider.text")} {numDistance} m
      </div>
      <Slider
        value={numDistance}
        onChange={handleDistanceChange}
        min={0}
        max={100}
        stepSize={1}
      />
    </div>
  )
}

export default DistanceSlider
