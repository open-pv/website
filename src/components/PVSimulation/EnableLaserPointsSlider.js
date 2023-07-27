import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Slider from "../Template/Slider"

const EnableLaserPointsSlider = () => {
  const [enableLaserPoints, setEnableLaserPoints] = useState(1)
  window.enableLaserPoints = enableLaserPoints
  const { t, i18n } = useTranslation()

  const handleEnableLaserPointsChange = (newValue) => {
    let enableLaserPointsNew = newValue
    setEnableLaserPoints(enableLaserPointsNew)
    window.enableLaserPoints = enableLaserPoints
  }

  return (
    <div>
      <div>
        {t("enableLaserPointsSlider.text")}{" "}
        {enableLaserPoints == 0 ? t("no") : t("yes")}
      </div>
      <Slider
        value={enableLaserPoints}
        onChange={handleEnableLaserPointsChange}
        min={0}
        max={1}
      />
    </div>
  )
}

export default EnableLaserPointsSlider
