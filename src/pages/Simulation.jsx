import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import WrongAdress from '../components/ErrorMessages/WrongAdress'
import Footer from '../components/Footer'
import LoadingBar from '../components/Template/LoadingBar'
import Scene from '../components/ThreeViewer/Scene'
import Main from '../Main'
import { mainSimulation } from '../simulation/main'

function Index() {
  const location = useParams()

  // frontendState defines the general state of the frontend (Results, Loading, DrawPV)
  const [frontendState, setFrontendState] = useState('Loading')

  // simulationProgress is used for the loading bar
  const [simulationProgress, setSimulationProgress] = useState(0)

  // The federal State where the material comes from, ie "BY"
  const [federalState, setFederalState] = useState(false)
  window.setFederalState = setFederalState

  // Buildings state – holds an array of building objects with {id, type, geometry, simulationMesh}
  const [buildings, setBuildings] = useState([])

  // expose setters for the simulation core
  window.setBuildings = setBuildings
  window.setFrontendState = setFrontendState
  window.setSimulationProgress = setSimulationProgress

  const [vegetationGeometries, setVegetationGeometries] = useState([])
  window.setVegetationGeometries = setVegetationGeometries

  const loadAndSimulate = async () => {
    await mainSimulation(location)
    setFrontendState('Results')
  }

  useEffect(() => {
    loadAndSimulate()
  }, [])

  return (
    <Main description={'Berechne das Potential deiner Solaranlage.'}>
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
    </Main>
  )
}

export default Index
