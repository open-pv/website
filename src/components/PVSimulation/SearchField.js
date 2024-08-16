import { Button, FormControl, Input } from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import * as THREE from "three"
import { mainSimulation } from "../../simulation/main"

function SearchField({
  frontendState,
  setFrontendState,
  setGeometries,
  displayedSimulationMesh,
  setDisplayedSimulationMesh,
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
      setDisplayedSimulationMesh([...displayedSimulationMesh, simulationMesh])
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
    <form
      style={{
        display: "flex",
        alignItems: "center",
        padding: "5px",
      }}
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        placeholder={t("searchField.placeholder")}
        value={inputValue}
        onChange={handleChange}
        margin={"5px"}
      />
      <Button
        isLoading={frontendState == "Loading"}
        type="submit"
        minWidth={"150px"}
        margin={"5px"}
        loadingText="Loading"
      >
        Start
      </Button>
    </form>
  )
}

export default SearchField
