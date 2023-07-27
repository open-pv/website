import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Slider from "../Template/Slider"

const VisualizeLaserPointsSlider = () => {
  const [pointsVisualizationRatio, setPointsVisualizationRatio] = useState(0)
  window.pointsVisualizationRatio = pointsVisualizationRatio
  const { t, i18n } = useTranslation()

  const handlePointsVisualizationRatioChange = (newValue) => {
    let pointsVisualizationRatioNew = Math.pow(10, newValue) - 0.01
    setPointsVisualizationRatio(pointsVisualizationRatioNew)
    window.pointsVisualizationRatio = pointsVisualizationRatio
    window.pointsVisualizationRatioChanged = true
  }

  return (
    <div>
      <div>
        {t("visualizeLaserPointsSlider.text")}{" "}
        {Math.floor(pointsVisualizationRatio * 100) / 100} {"%"}
      </div>
      <Slider
        value={Math.log(pointsVisualizationRatio + 0.01) / Math.log(10)}
        onChange={handlePointsVisualizationRatioChange}
        min={-2}
        max={Math.log(1.01) / Math.log(10)}
        stepSize={0.1}
      />
    </div>
  )
}

export default VisualizeLaserPointsSlider
