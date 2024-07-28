import React, { useState } from "react"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import SearchField from "../components/PVSimulation/SearchField"
import LoadingBar from "../components/Template/LoadingBar"
import Footer from "../components/ThreeViewer/Footer"
import Map from "../components/ThreeViewer/Map"
import OverlayDrawPV from "../components/ThreeViewer/OverlayDrawPV"
import OverlayResults from "../components/ThreeViewer/OverlayResults"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../layouts/Main"

function Index() {
  // Frontend States
  const [frontendState, setFrontendState] = useState("Map")
  const [showTerrain, setShowTerrain] = useState(true)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [visiblePVSystems, setvisiblePVSystems] = useState([])
  const [federalState, setFederalState] = useState(false)
  window.setFederalState = setFederalState

  // Simulation States
  const [geometries, setGeometries] = useState({
    surrounding: [],
    background: [],
  })
  const [displayedSimulationMesh, setDisplayedSimluationMesh] =
    useState(undefined)

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
        {frontendState == "ErrorAdress" && <WrongAdress />}
        {frontendState == "Map" && <Map />}
        {frontendState == "Results" && (
          <OverlayResults
            setFrontendState={setFrontendState}
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
          />
        )}
        {frontendState == "DrawPV" && (
          <OverlayDrawPV
            setvisiblePVSystems={setvisiblePVSystems}
            visiblePVSystems={visiblePVSystems}
          />
        )}
        {(frontendState == "Results" || frontendState == "DrawPV") && (
          <Scene
            geometries={geometries}
            simulationMesh={displayedSimulationMesh}
            showTerrain={showTerrain}
            frontendState={frontendState}
            visiblePVSystems={visiblePVSystems}
          />
        )}

        {frontendState == "Loading" && (
          <LoadingBar progress={simulationProgress} />
        )}
      </div>
      <Footer federalState={federalState} />
    </Main>
  )
}

export default Index
