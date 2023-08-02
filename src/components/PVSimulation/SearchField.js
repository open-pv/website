import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import DotLoader from "react-spinners/DotLoader"
import { setLocation } from "../../simulation/download"
import TooManyUniforms from "../ErrorMessages/TooManyUniforms"
import WrongAdress from "../ErrorMessages/WrongAdress"

const override = {
  display: "block",
  margin: "auto",
  borderColor: "red",
}

function SearchField() {
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [inputChanged, setInputChanged] = useState(false)
  const { t, i18n } = useTranslation()
  const [showTooManyUniformsError, setShowTooManyUniformsError] =
    useState(false)
  window.setShowErrorMessage = setShowErrorMessage
  window.setShowTooManyUniformsError = setShowTooManyUniformsError
  window.setLoading = setLoading
  const handleSubmit = (event) => {
    setLoading(!loading)
    window.setShowViridisLegend(false)
    event.preventDefault()
    window.setShowThreeViewer(true)
    setLocation(inputValue, inputChanged, window.mapLocation)
    window.numRadiusSimulationChanged = false
    window.numSimulationsChanged = false
    window.mapLocationChanged = false
    setShowErrorMessage(false)
    setShowTooManyUniformsError(false)
    setInputChanged(false)
  }
  const handleChange = (event) => {
    if (inputValue != event.target.value) {
      setInputValue(event.target.value)
      setInputChanged(true)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "center" }}
        id="search-field"
      >
        <input
          type="text"
          placeholder={t("searchField.placeholder")}
          value={inputValue}
          onChange={handleChange}
        />
        <button type="submit">Start</button>
      </form>
      {showErrorMessage && <WrongAdress />}
      {showTooManyUniformsError && <TooManyUniforms />}
      <DotLoader
        color="MediumAquaMarine"
        cssOverride={override}
        loading={loading}
        size={60}
      />
      {window.enableLaserPoints && loading && (
        <div style={{ padding: "30px" }}>
          <p style={{ textAlign: "center" }}>{t("laserPoints.warning")}</p>
        </div>
      )}
    </>
  )
}

export default SearchField
