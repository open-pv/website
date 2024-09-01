import React, { useRef, useState } from "react"
import { Canvas } from "react-three-fiber"

import CustomMapControl from "./Controls/CustomMapControl"
import DrawPVControl from "./Controls/DrawPVControl"
import { HighlightedMesh } from "./Meshes/HiglightedMesh"
import { PVSystems } from "./Meshes/PVSystems"
import SimulationMesh from "./Meshes/SimulationMesh"
import SurroundingMesh from "./Meshes/SurroundingMesh"
import Points from "./Points"
import Terrain from "./Terrain"

const Scene = ({
  geometries,
  simulationMeshes,
  showTerrain,
  frontendState,
  pvSystems,
  selectedMesh,
  setSelectedMesh,
  pvPoints,
  setPVPoints,
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
      <directionalLight intensity={2} position={[0, 1, -2]} />

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
      {simulationMeshes.length > 0 && frontendState == "Results" && (
        <CustomMapControl
          middle={simulationMeshes[0].middle}
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
        />
      )}
      {frontendState == "DrawPV" && (
        <DrawPVControl
          middle={simulationMeshes[0].middle}
          setPVPoints={setPVPoints}
        />
      )}
      {frontendState == "DrawPV" && <Points points={pvPoints} />}

      {pvSystems.length > 0 && <PVSystems pvSystems={pvSystems} />}

      {simulationMeshes.length > 0 && <Terrain visible={showTerrain} />}
    </Canvas>
  )
}

export default Scene
