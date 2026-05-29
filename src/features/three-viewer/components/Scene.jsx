import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import Overlay from '@/features/three-viewer/components/Overlay'
import PointsAndEdges from '@/features/three-viewer/components/PointsAndEdges'
import Terrain from '@/features/three-viewer/components/Terrain'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import CustomMapControl from '@/features/three-viewer/controls/CustomMapControl'
import DrawPVControl from '@/features/three-viewer/controls/DrawPVControl'
import { BuildingMesh } from '@/features/three-viewer/meshes/BuildingMesh'
import { PVSystem } from '@/features/three-viewer/meshes/PVSystems'
import VegetationMesh from '@/features/three-viewer/meshes/VegetationMesh'
import { FrontendState } from '@/types'

const Scene = ({
  frontendState,
  setFrontendState,
  buildings,
  simulationResult,
  vegetationGeometries,
  geoLocation,
}) => {
  const [showTerrain, setShowTerrain] = useState(true)
  const [pvSystems, setPVSystems] = useState([])
  const [pvPoints, setPVPoints] = useState([])
  const [slope, setSlope] = useState('')
  const [azimuth, setAzimuth] = useState('')
  const [yieldPerKWP, setYieldPerKWP] = useState('')
  const [isOpenSavingCalculation, setIsOpenSavingCalculation] = useState(false)
  const [selectedPVSystem, setSelectedPVSystem] = useState(null)

  // Determine camera start position from the scene-level simulation result
  let position = [0, 0, 0]
  if (simulationResult?.center) {
    const m = simulationResult.center
    position = [m.x, m.y - 40, m.z + 80]
  }

  const cameraRef = useRef()

  return (
    <SceneContext.Provider
      value={{
        buildings,
        simulationResult,
        setFrontendState,
        pvPoints,
        setPVPoints,
        pvSystems,
        setPVSystems,
        showTerrain,
        setShowTerrain,
        slope,
        setSlope,
        azimuth,
        setAzimuth,
        yieldPerKWP,
        setYieldPerKWP,
        isOpenSavingCalculation,
        setIsOpenSavingCalculation,
        selectedPVSystem,
        setSelectedPVSystem,
      }}
    >
      <Overlay
        frontendState={frontendState}
        setFrontendState={setFrontendState}
        geoLocation={geoLocation}
      />

      <Canvas
        camera={{
          fov: 45,
          near: 1,
          far: 20000,
          position: position,
          up: [0, 0, 1],
          ref: cameraRef,
        }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      >
        <ambientLight intensity={2} />
        <directionalLight intensity={1} position={[0, -1, -2]} />
        <directionalLight intensity={0.5} position={[1, 0, -2]} />
        <directionalLight intensity={0.5} position={[-1, 0, -2]} />

        {buildings.length > 0 &&
          buildings.map((b) => <BuildingMesh key={b.id} building={b} />)}

        {simulationResult && (
          <primitive object={simulationResult.mesh} dispose={null} />
        )}

        {simulationResult && frontendState === FrontendState.Results && (
          <CustomMapControl />
        )}
        {frontendState === FrontendState.DrawPV && <DrawPVControl />}
        {frontendState === FrontendState.DrawPV && <PointsAndEdges />}

        {pvSystems.length > 0 &&
          pvSystems.map((pvSystem) => (
            <PVSystem pvSystem={pvSystem} key={pvSystem.id} />
          ))}

        {vegetationGeometries && (
          <>
            {vegetationGeometries.background &&
              vegetationGeometries.background.length > 0 && (
                <VegetationMesh geometries={vegetationGeometries.background} />
              )}
            {vegetationGeometries.surrounding &&
              vegetationGeometries.surrounding.length > 0 && (
                <VegetationMesh geometries={vegetationGeometries.surrounding} />
              )}
          </>
        )}

        {simulationResult && <Terrain />}
      </Canvas>
    </SceneContext.Provider>
  )
}

export default Scene
