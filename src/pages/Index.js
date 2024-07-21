import React, { useState } from "react"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import SearchField from "../components/PVSimulation/SearchField"
import LoadingBar from "../components/Template/LoadingBar"
import Map from "../components/ThreeViewer/Map"
import Overlay from "../components/ThreeViewer/Overlay"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../layouts/Main"

function Index() {
  // Frontend States
  const [showMap, setShowMap] = useState(true)
  const [frontendState, setFrontendState] = useState("Map")
  const [isDrawPV, setIsDrawPV] = useState(false)
  const [showErrorNoGeometry, setshowErrorNoGeometry] = useState(false)
  const [showTerrain, setShowTerrain] = useState(true)
  const [simulationProgress, setSimulationProgress] = useState(0)

  // Simulation States
  const [geometries, setGeometries] = useState({
    surrounding: [],
    background: [],
  })
  const [displayedSimulationMesh, setDisplayedSimluationMesh] =
    useState(undefined)

  window.setShowThreeViewer = setShowMap
  window.setshowErrorNoGeometry = setshowErrorNoGeometry
  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <header>
        <div className="title">
          <SearchField
            setFrontendState={setFrontendState}
            setGeometries={setGeometries}
            setDisplayedSimluationMesh={setDisplayedSimluationMesh}
          />
        </div>
      </header>
      <div className="content">
        {showErrorNoGeometry && <WrongAdress />}
        {showMap && <Map />}
        {frontendState == "Results" && (
          <Overlay
            setIsDrawPV={setIsDrawPV}
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
          />
        )}
        {frontendState == "Results" && (
          <Scene
            geometries={geometries}
            simulationMesh={displayedSimulationMesh}
            showTerrain={showTerrain}
          />
        )}

        {frontendState == "Loading" && (
          <LoadingBar progress={simulationProgress} />
        )}
      </div>
    </Main>
  )
}

export default Index
