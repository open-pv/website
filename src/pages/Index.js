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
  const [frontendState, setFrontendState] = useState("Map")
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

  window.setshowErrorNoGeometry = setshowErrorNoGeometry
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
        {frontendState == "Map" && <Map />}
        {frontendState == "Results" && (
          <Overlay
            setFrontendState={setFrontendState}
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
          />
        )}
        {(frontendState == "Results" || frontendState == "DrawPV") && (
          <Scene
            geometries={geometries}
            simulationMesh={displayedSimulationMesh}
            showTerrain={showTerrain}
            frontendState={frontendState}
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
