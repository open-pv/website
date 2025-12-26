import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import WrongAdress from '@/components/errors/WrongAddress'
import Footer from '@/components/layout/Footer'
import LoadingBar from '@/components/layout/LoadingBar'
import Scene from '@/features/three-viewer/components/Scene'
import App from '@/app/App'
import { mainSimulation } from '@/features/simulation/core/main'

function Index() {
  const location = useParams()

  // frontendState defines the general state of the frontend (Results, Loading, DrawPV)
  const [frontendState, setFrontendState] = useState('Loading')

  // simulationProgress is used for the loading bar
  const [simulationProgress, setSimulationProgress] = useState(0)

  // The federal State where the material comes from, ie "BY"
  const [federalState, setFederalState] = useState(false)
  window.setFederalState = setFederalState

  // Buildings state – holds an array of building objects with
  // {id:int,
  // type:["simulation", "background", "surrounding"],
  // geometry: Threejs geometry (all buildings),
  // mesh: Threejs colored mesh (only simulated buildings)}
  const [buildings, setBuildings] = useState([])

  // expose setters for the simulation core
  window.setBuildings = setBuildings
  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  const [vegetationGeometries, setVegetationGeometries] = useState([])
  window.setVegetationGeometries = setVegetationGeometries

  const loadAndSimulate = async () => {
    await mainSimulation(location)
  }

  useEffect(() => {
    loadAndSimulate()
  }, [])

  return (
    <App description={'Berechne das Potential deiner Solaranlage.'}>
      <div className='content'>
        {frontendState == 'ErrorAdress' && <WrongAdress />}

        {(frontendState == 'Results' || frontendState == 'DrawPV') && (
          <Scene
            frontendState={frontendState}
            setFrontendState={setFrontendState}
            buildings={buildings}
            vegetationGeometries={vegetationGeometries}
            geoLocation={location}
          />
        )}

        {frontendState == 'Loading' && (
          <LoadingBar progress={simulationProgress} />
        )}
        <Footer federalState={federalState} frontendState={frontendState} />
      </div>
    </App>
  )
}

export default Index
