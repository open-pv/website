import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import * as THREE from "three"
import { mainSimulation } from "../../simulation/main"

function SearchField({
  setFrontendState,
  setGeometries,
  setDisplayedSimluationMesh,
}) {
  const [inputValue, setInputValue] = useState("Arnulfstraße 138, Münche")
  window.searchFieldInput = inputValue
  const [inputChanged, setInputChanged] = useState(false)
  const { t, i18n } = useTranslation()

  const handleSubmit = async (event) => {
    setFrontendState("Loading")
    event.preventDefault()

    const { simulationMesh, geometries } = await mainSimulation(
      inputValue,
      inputChanged,
      window.mapLocation,
      setGeometries
    )
    if (simulationMesh) {
      let middle = new THREE.Vector3()
      simulationMesh.geometry.computeBoundingBox()
      simulationMesh.geometry.boundingBox.getCenter(middle)
      simulationMesh.middle = middle

      setGeometries(geometries)
      setDisplayedSimluationMesh(simulationMesh)
      setFrontendState("Results")
    }
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
