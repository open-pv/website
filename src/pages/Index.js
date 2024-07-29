import React, { useState } from "react"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import SearchField from "../components/PVSimulation/SearchField"
import LoadingBar from "../components/Template/LoadingBar"
import Footer from "../components/ThreeViewer/Footer"
import Map from "../components/ThreeViewer/Map"
import OverlayDrawPV from "../components/ThreeViewer/OverlayDrawPV"
import OverlayResults from "../components/ThreeViewer/OverlayResults"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../Main"

function Index() {
  // Frontend States
  const [frontendState, setFrontendState] = useState("Map")
  const [showTerrain, setShowTerrain] = useState(true)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [visiblePVSystems, setvisiblePVSystems] = useState([])
  const [deletedSurroundingMeshes, setDeletedSurroundingMeshes] = useState([])
  const [deletedBackgroundMeshes, setDeletedBackgroundMeshes] = useState([])
  window.setDeletedSurroundingMeshes = setDeletedSurroundingMeshes
  window.setDeletedBackgroundMeshes = setDeletedBackgroundMeshes
  const [federalState, setFederalState] = useState(false)
  window.setFederalState = setFederalState

  // Simulation States
  const [geometries, setGeometries] = useState({
    surrounding: [],
    background: [],
  })
  const [displayedSimulationMesh, setDisplayedSimulationMesh] = useState([])
  const [selectedMesh, setSelectedMesh] = useState([])
  const [geoLocation, setGeoLocation] = useState()
  window.setGeoLocation = setGeoLocation

  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <header>
        <div className="title">
          <SearchField
            setFrontendState={setFrontendState}
            setGeometries={setGeometries}
            displayedSimulationMesh={displayedSimulationMesh}
            setDisplayedSimulationMesh={setDisplayedSimulationMesh}
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
            selectedMesh={selectedMesh}
            setSelectedMesh={setSelectedMesh}
            geometries={geometries}
            displayedSimulationMesh={displayedSimulationMesh}
            setDisplayedSimulationMesh={setDisplayedSimulationMesh}
            deletedSurroundingMeshes={deletedSurroundingMeshes}
            deletedBackgroundMeshes={deletedBackgroundMeshes}
            geoLocation={geoLocation}
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
            selectedMesh={selectedMesh}
            setSelectedMesh={setSelectedMesh}
            deletedSurroundingMeshes={deletedSurroundingMeshes}
            deletedBackgroundMeshes={deletedBackgroundMeshes}
          />
        )}

        {frontendState == "Loading" && (
          <LoadingBar progress={simulationProgress} />
        )}
        <Footer federalState={federalState} frontendState={frontendState} />
      </div>
    </Main>
  )
}

export default Index
