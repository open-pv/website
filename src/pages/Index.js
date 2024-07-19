import React, { useState } from "react"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import SearchField from "../components/PVSimulation/SearchField"
import Map from "../components/ThreeViewer/Map"
import Overlay from "../components/ThreeViewer/Overlay"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../layouts/Main"

function Index() {
  // Frontend States
  const [showMap, setShowMap] = useState(true)
  const [showSimulatedBuilding, setshowSimulatedBuilding] = useState(false)
  const [isDrawPV, setIsDrawPV] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorNoGeometry, setshowErrorNoGeometry] = useState(false)

  // Simulation States
  const [geometries, setGeometries] = useState({
    surrounding: [],
    background: [],
  })
  const [displayedSimulationMesh, setDisplayedSimluationMesh] =
    useState(undefined)

  window.setShowThreeViewer = setShowMap
  window.setshowErrorNoGeometry = setshowErrorNoGeometry
  window.setIsLoading = setIsLoading
  window.setshowSimulatedBuilding = setshowSimulatedBuilding

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <header>
        <div className="title">
          <SearchField
            setShowScene={setshowSimulatedBuilding}
            setGeometries={setGeometries}
            setDisplayedSimluationMesh={setDisplayedSimluationMesh}
          />
        </div>
      </header>
      <div class="content">
        {showErrorNoGeometry && <WrongAdress />}
        {showMap && <Map />}
        {showSimulatedBuilding && (
          <Scene
            geometries={geometries}
            simulationMesh={displayedSimulationMesh}
          />
        )}
        {showSimulatedBuilding && <Overlay setIsDrawPV={setIsDrawPV} />}
        {isLoading && <p>Show Loading Bar Component Now</p>}
      </div>
    </Main>
  )
}

export default Index
