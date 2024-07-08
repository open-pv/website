import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { main } from "../../simulation/main"

function SearchField({ setIsLoading, setshowSimulatedBuilding }) {
  const [inputValue, setInputValue] = useState("")

  const [inputChanged, setInputChanged] = useState(false)
  const { t, i18n } = useTranslation()

  const handleSubmit = (event) => {
    setIsLoading(true)
    event.preventDefault()

    main(inputValue, inputChanged, window.mapLocation)
    setshowSimulatedBuilding(true)
    window.numRadiusSimulationChanged = false
    window.numSimulationsChanged = false
    window.mapLocationChanged = false
    window.setShowErrorMessage(false)
    window.setShowTooManyUniformsError(false)
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
    </>
  )
}

export default SearchField
