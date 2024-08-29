import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import * as THREE from "three"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import LoadingBar from "../components/Template/LoadingBar"
import Footer from "../components/ThreeViewer/Footer"
import Overlay from "../components/ThreeViewer/Overlay"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../Main"
import { mainSimulation } from "../simulation/main"

function Index() {
  const location = useParams()

  // frontendState defines the general state of the frontend (Results, Loading, DrawPV)
  const [frontendState, setFrontendState] = useState("Loading")
  // showTerrain decides if the underlying Map is visible or not
  const [showTerrain, setShowTerrain] = useState(true)
  // simulationProgress is used for the loading bar
  const [simulationProgress, setSimulationProgress] = useState(0)
  // A list of visible PV Systems - they get visible after they are drawn on a building and calculated
  const [visiblePVSystems, setvisiblePVSystems] = useState([])
  // pvPoints are the red points that appear when drawing PV systems
  const [pvPoints, setPVPoints] = useState([])

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

  // When a building is selected from the Surrounding to be simulated, it needs to be deleted
  // from the surrounding mesh. This state collects a list of names that should not be rendered
  // Elements are for example "SurroundingMesh-37"
  const [simulationMeshes, setSimulationMeshes] = useState([])

  window.setGeometries = setGeometries
  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  const loadAndSimulate = async () => {
    const { simulationMesh, geometries } = await mainSimulation(location)
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

  useEffect(() => {
    loadAndSimulate()
  }, [])

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <div className="content">
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
            geoLocation={location}
            setvisiblePVSystems={setvisiblePVSystems}
            visiblePVSystems={visiblePVSystems}
            pvPoints={pvPoints}
            setPVPoints={setPVPoints}
          />
        )}
        {frontendState == "ErrorAdress" && <WrongAdress />}

        {(frontendState == "Results" || frontendState == "DrawPV") && (
          <Scene
            geometries={geometries}
            simulationMesh={displayedSimulationMesh}
            showTerrain={showTerrain}
            frontendState={frontendState}
            visiblePVSystems={visiblePVSystems}
            selectedMesh={selectedMesh}
            setSelectedMesh={setSelectedMesh}
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
