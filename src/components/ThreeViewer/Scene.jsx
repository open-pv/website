import React, { useRef } from "react"
import { Canvas } from "react-three-fiber"

import CustomMapControl from "./Controls/CustomMapControl"
import DrawPVControl from "./Controls/DrawPVControl"
import { HighlightedPVSystem } from "./Meshes/HighlitedPVSystem"
import { HighlightedMesh } from "./Meshes/HiglightedMesh"
import { PVSystems } from "./Meshes/PVSystems"
import SimulationMesh from "./Meshes/SimulationMesh"
import SurroundingMesh from "./Meshes/SurroundingMesh"
import VegetationMesh from "./Meshes/VegetationMesh"
import PointsAndEdges from "./PointsAndEdges"
import Terrain from "./Terrain"

const Scene = ({
  geometries,
  simulationMeshes,
  showTerrain,
  frontendState,
  pvSystems,
  selectedMesh,
  setSelectedMesh,
  selectedPVSystem,
  setSelectedPVSystem,
  pvPoints,
  setPVPoints,
  vegetationGeometries,
}) => {
  window.setPVPoints = setPVPoints
  const position = [
    simulationMeshes[0].middle.x,
    simulationMeshes[0].middle.y - 40,
    simulationMeshes[0].middle.z + 80,
  ]
  const cameraRef = useRef()
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 1,
        far: 20000,
        position: position,
        up: [0, 0, 1],
        ref: cameraRef,
      }}
    >
      <ambientLight intensity={2} />
      <directionalLight intensity={1} position={[0, -1, -2]} />
      <directionalLight intensity={0.5} position={[1, 0, -2]} />
      <directionalLight intensity={0.5} position={[-1, 0, -2]} />

      {geometries.surrounding.length > 0 && (
        <SurroundingMesh geometries={geometries.surrounding} />
      )}
      {geometries.background.length > 0 && (
        <SurroundingMesh geometries={geometries.background} />
      )}

      {simulationMeshes.length > 0 && (
        <SimulationMesh meshes={simulationMeshes} />
      )}
      {selectedMesh && <HighlightedMesh meshes={selectedMesh} />}
      {selectedPVSystem && <HighlightedPVSystem meshes={selectedPVSystem} />}
      {simulationMeshes.length > 0 && frontendState == "Results" && (
        <CustomMapControl
          middle={simulationMeshes[0].middle}
          setSelectedMesh={setSelectedMesh}
          setSelectedPVSystem={setSelectedPVSystem}
        />
      )}
      {frontendState == "DrawPV" && (
        <DrawPVControl
          middle={simulationMeshes[0].middle}
          setPVPoints={setPVPoints}
        />
      )}
      {frontendState == "DrawPV" && <PointsAndEdges points={pvPoints} />}

      {pvSystems.length > 0 && <PVSystems pvSystems={pvSystems} />}

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

      {simulationMeshes.length > 0 && <Terrain visible={showTerrain} />}
    </Canvas>
  )
}

export default Scene
