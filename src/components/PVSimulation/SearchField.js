import { Button, FormControl, Input } from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import * as THREE from "three"
import { mainSimulation } from "../../simulation/main"
import { requestLocation } from "../../simulation/location"

function SearchField({ callback }) {
  const [inputValue, setInputValue] = useState("Arnulfstraße 138, München")
  window.searchFieldInput = inputValue
  const { t, i18n } = useTranslation()

  const handleSubmit = async (event) => {
    console.warn("Loading");
    event.preventDefault()
    const locations = await requestLocation(inputValue)
    console.warn(location);
    callback(locations);

    /*
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
    */
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
        onChange={evt => setInputValue(evt.target.value)}
        margin={"5px"}
      />
      <Button
        isLoading={ false }
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
