import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import Switch from "@mui/material/Switch"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

export const EnableLaserPointsSwitch = () => {
  const { t, i18n } = useTranslation()
  const [enableLaserPoints, setEnableLaserPoints] = useState(false)
  window.enableLaserPoints = enableLaserPoints
  const onChange = (event) => {
    setEnableLaserPoints(event.target.checked)
    console.log(event.target.checked)
  }
  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={enableLaserPoints} />}
        label={t("enableLaserPointsSlider.text")}
        onChange={onChange}
      />
    </FormGroup>
  )
}
