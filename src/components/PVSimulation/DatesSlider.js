import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Slider from "../Template/Slider"

const DatesSlider = () => {
  const [numSimulations, setNumSimulations] = useState(80)
  window.numSimulations = numSimulations
  const { t, i18n } = useTranslation()

  const handleNumSimulationsChange = (newValue) => {
    let numSimulationsNew = Math.floor(Math.pow(10, newValue))
    setNumSimulations(numSimulationsNew)
    window.numSimulations = numSimulations
    window.numSimulationsChanged = true
  }

  return (
    <div>
      <div>
        {t("datesSlider.text")} {numSimulations}
      </div>
      <Slider
        onChange={handleNumSimulationsChange}
        min={0}
        max={2.2}
        stepSize={0.01}
      />
    </div>
  )
}

export default DatesSlider
