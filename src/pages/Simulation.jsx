import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import Footer from "../components/Footer"
import LoadingBar from "../components/Template/LoadingBar"
import Scene from "../components/ThreeViewer/Scene"
import Main from "../Main"
import { mainSimulation } from "../simulation/main"

function Index() {
  const location = useParams()

  // frontendState defines the general state of the frontend (Results, Loading, DrawPV)
  const [frontendState, setFrontendState] = useState("Loading")

  // simulationProgress is used for the loading bar
  const [simulationProgress, setSimulationProgress] = useState(0)

  // The federal State where the material comes from, ie "BY"
  const [federalState, setFederalState] = useState(false)
  window.setFederalState = setFederalState

  // Simulation States
  const [geometries, setGeometries] = useState({
    simulation: [],
    surrounding: [],
    background: [],
  })

  // meshes that were simulated
  const [simulationMeshes, setSimulationMeshes] = useState([])

  window.setGeometries = setGeometries
  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  const [vegetationGeometries, setVegetationGeometries] = useState([])
  window.setVegetationGeometries = setVegetationGeometries

  const loadAndSimulate = async () => {
    const { simulationMesh } = await mainSimulation(location)
    if (simulationMesh) {
      setSimulationMeshes([...simulationMeshes, simulationMesh])
      setFrontendState("Results")
    }
  }

  useEffect(() => {
    loadAndSimulate()
  }, [])

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <div className="content">
        {frontendState == "ErrorAdress" && <WrongAdress />}

        {(frontendState == "Results" || frontendState == "DrawPV") && (
          <Scene
            frontendState={frontendState}
            setFrontendState={setFrontendState}
            geometries={geometries}
            simulationMeshes={simulationMeshes}
            setSimulationMeshes={setSimulationMeshes}
            vegetationGeometries={vegetationGeometries}
            geoLocation={location}
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
