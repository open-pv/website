import { useRef, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'

import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import CustomMapControl from '@/features/three-viewer/controls/CustomMapControl'
import DrawPVControl from '@/features/three-viewer/controls/DrawPVControl'
import { BuildingMesh } from '@/features/three-viewer/meshes/BuildingMesh'
import { PVSystem, PVSystems } from '@/features/three-viewer/meshes/PVSystems'
import VegetationMesh from '@/features/three-viewer/meshes/VegetationMesh'
import Overlay from '@/features/three-viewer/components/Overlay'
import PointsAndEdges from '@/features/three-viewer/components/PointsAndEdges'
import Terrain from '@/features/three-viewer/components/Terrain'

const Scene = ({
  frontendState,
  setFrontendState,
  buildings,
  vegetationGeometries,
  geoLocation,
}) => {
  // showTerrain decides if the underlying Map is visible or not
  const [showTerrain, setShowTerrain] = useState(true)
  // A list of visible PV Systems - they get visible after they are drawn on a building and calculated
  const [pvSystems, setPVSystems] = useState([])
  // pvPoints are the red points that appear when drawing PV systems
  const [pvPoints, setPVPoints] = useState([])
  // highlighted PVSystems for deletion or calculation
  const [selectedPVSystem, setSelectedPVSystem] = useState([])
  const [slope, setSlope] = useState('')
  const [azimuth, setAzimuth] = useState('')
  const [yieldPerKWP, setYieldPerKWP] = useState('')

  window.setPVPoints = setPVPoints

  // Determine camera start position based on the first simulation building (if any)
  let position = [0, 0, 0]
  const firstSimBuilding = buildings.find((b) => b.type === 'simulation')
  if (firstSimBuilding && firstSimBuilding.simulationMiddle) {
    const m = firstSimBuilding.simulationMiddle
    position = [m.x, m.y - 40, m.z + 80]
  }

  const cameraRef = useRef()
  // Derive grouped building arrays from the unified buildings state
  const simulationBuildings = buildings.filter((b) => b.type === 'simulation')

  return (
    <SceneContext.Provider
      value={{
        buildings,
        pvPoints,
        setPVPoints,
        selectedPVSystem,
        setSelectedPVSystem,
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
          buildings.map((b) => <BuildingMesh building={b} />)}

        {selectedPVSystem &&
          selectedPVSystem.map((geometry, index) => (
            <PVSystem key={index} geometry={geometry} highlighted={true} />
          ))}
        {simulationBuildings.length > 0 && frontendState == 'Results' && (
          <CustomMapControl />
        )}
        {frontendState == 'DrawPV' && <DrawPVControl />}
        {frontendState == 'DrawPV' && <PointsAndEdges />}

        {pvSystems.length > 0 && <PVSystems />}

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

        {simulationBuildings.length > 0 && <Terrain />}
      </Canvas>
    </SceneContext.Provider>
  )
}

export default Scene
