import React, { useState } from "react"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import SavingCalculation from "../components/PVSimulation/SavingsCalculation"
import SearchField from "../components/PVSimulation/SearchField"
import LoadingBar from "../components/Template/LoadingBar"
import WelcomeMessage from "../components/Template/WelcomeMessage"
import Footer from "../components/ThreeViewer/Footer"
import Map from "../components/ThreeViewer/Map"
import Overlay from "../components/ThreeViewer/Overlay"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../Main"

function Index() {
  // frontendState defines the general state of the frontend (Map, Results, Loading, DrawPV)
  const [frontendState, setFrontendState] = useState("Map")
  // showTerrain decides if the underlying Map is visible or not
  const [showTerrain, setShowTerrain] = useState(true)
  // simulationProgress is used for the loading bar
  const [simulationProgress, setSimulationProgress] = useState(0)
  // A list of visible PV Systems - they get visible after they are drawn on a building and calculated
  const [visiblePVSystems, setvisiblePVSystems] = useState([])
  // pvPoints are the red points that appear when drawing PV systems
  const [pvPoints, setPVPoints] = useState([])
  // When a building is selected from the Surrounding to be simulated, it needs to be deleted
  // from the surrounding mesh. This state collects a list of names that should not be rendered
  // Elements are for example "SurroundingMesh-37"
  const [deletedSurroundingMeshes, setDeletedSurroundingMeshes] = useState([])
  window.setDeletedSurroundingMeshes = setDeletedSurroundingMeshes
  // The federal State where the material comes from, ie "BY"
  const [federalState, setFederalState] = useState(false)
  window.setFederalState = setFederalState

  // Simulation States
  const [geometries, setGeometries] = useState({
    surrounding: [],
    background: [],
  })
  const [displayedSimulationMesh, setDisplayedSimulationMesh] = useState([])
  const [selectedMesh, setSelectedMesh] = useState([])
  //geoLocation is an object with lat, lon
  const [geoLocation, setGeoLocation] = useState()
  window.setGeoLocation = setGeoLocation

  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <header>
        <div className="title">
          <SearchField
            frontendState={frontendState}
            setFrontendState={setFrontendState}
            setGeometries={setGeometries}
            displayedSimulationMesh={displayedSimulationMesh}
            setDisplayedSimulationMesh={setDisplayedSimulationMesh}
          />
        </div>
      </header>
      <div className="content">
        <WelcomeMessage />

        {(frontendState == "Results" || frontendState == "DrawPV") && (
          <Overlay
            frontendState={frontendState}
            setFrontendState={setFrontendState}
            showTerrain={showTerrain}
            setShowTerrain={setShowTerrain}
            selectedMesh={selectedMesh}
            setSelectedMesh={setSelectedMesh}
            geometries={geometries}
            displayedSimulationMesh={displayedSimulationMesh}
            setDisplayedSimulationMesh={setDisplayedSimulationMesh}
            deletedSurroundingMeshes={deletedSurroundingMeshes}
            geoLocation={geoLocation}
            setvisiblePVSystems={setvisiblePVSystems}
            visiblePVSystems={visiblePVSystems}
            pvPoints={pvPoints}
            setPVPoints={setPVPoints}
          />
        )}
        {frontendState == "ErrorAdress" && <WrongAdress />}
        {frontendState == "Map" && <Map />}

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
            pvPoints={pvPoints}
            setPVPoints={setPVPoints}
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
