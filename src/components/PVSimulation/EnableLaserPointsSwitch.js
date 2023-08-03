import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { InlineSlider } from "../Template/Slider"

export const EnableLaserPointsSwitch = () => {
  const { t, i18n } = useTranslation()
  const [enableLaserPoints, setEnableLaserPoints] = useState(false)
  window.enableLaserPoints = enableLaserPoints
  const onChange = (newValue) => {
    setEnableLaserPoints(newValue == 1 ? true : false)
  }
  return (
    <div id={"enableLaserPointsSlider"}>
      {t("enableLaserPointsSlider.text")}
      {" (y/n) :"}
      <InlineSlider
        value={enableLaserPoints ? 1 : 0}
        onChange={onChange}
        min={0}
        max={1}
        stepSize={1}
      />
    </div>
  )
}
