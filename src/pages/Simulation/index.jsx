import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import WrongAdress from '@/components/errors/WrongAddress'
import Footer from '@/components/layout/Footer'
import LoadingBar from '@/components/layout/LoadingBar'
import Scene from '@/features/three-viewer/components/Scene'
import App from '@/app/App'
import { mainSimulation } from '@/features/simulation/core/main'
import { FrontendState } from '@/types'

function Index() {
  const location = useParams()

  const [frontendState, setFrontendState] = useState(FrontendState.Loading)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [federalState, setFederalState] = useState(false)
  const [buildings, setBuildings] = useState([])
  const [simulationResult, setSimulationResult] = useState(null)
  const [vegetationGeometries, setVegetationGeometries] = useState({
    surrounding: [],
    background: [],
  })

  const loadAndSimulate = async () => {
    const out = await mainSimulation(location, {
      onProgress: (progress, total) =>
        setSimulationProgress((progress * 100) / total),
    })
    if (!out) {
      setFrontendState(FrontendState.ErrorAddress)
      return
    }
    setBuildings(out.buildings)
    setSimulationResult(out.simulationResult)
    setVegetationGeometries(out.vegetation)
    setFederalState(out.federalState)
    setFrontendState(FrontendState.Results)
  }

  useEffect(() => {
    loadAndSimulate()
  }, [])

  return (
    <App description={'Berechne das Potential deiner Solaranlage.'}>
      <div className='content'>
        {frontendState === FrontendState.ErrorAddress && <WrongAdress />}

        {(frontendState === FrontendState.Results ||
          frontendState === FrontendState.DrawPV) && (
          <Scene
            frontendState={frontendState}
            setFrontendState={setFrontendState}
            buildings={buildings}
            simulationResult={simulationResult}
            vegetationGeometries={vegetationGeometries}
            geoLocation={location}
          />
        )}

        {frontendState === FrontendState.Loading && (
          <LoadingBar progress={simulationProgress} />
        )}
        <Footer federalState={federalState} frontendState={frontendState} />
      </div>
    </App>
  )
}

export default Index
