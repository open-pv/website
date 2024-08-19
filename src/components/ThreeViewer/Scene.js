import React, { useRef, useState } from "react"
import { Canvas } from "react-three-fiber"

import CustomMapControl from "./Controls/CustomMapControl"
import DrawPVControl from "./Controls/DrawPVControl"
import { HighlightedMesh } from "./Meshes/HiglightedMesh"
import PVSystems from "./Meshes/PVSystems"
import SimulationMesh from "./Meshes/SimulationMesh"
import SurroundingMesh from "./Meshes/SurroundingMesh"
import Points from "./Points"
import Terrain from "./Terrain"

const Scene = ({
  simulationMesh,
  geometries,
  showTerrain,
  frontendState,
  visiblePVSystems,
  selectedMesh,
  setSelectedMesh,
  deletedSurroundingMeshes,
  pvPoints,
  setPVPoints,
}) => {
  window.setPVPoints = setPVPoints
  const position = [
    simulationMesh[0].middle.x,
    simulationMesh[0].middle.y - 40,
    simulationMesh[0].middle.z + 80,
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
      <directionalLight intensity={1} position={[0, 1, -10]} />

      {geometries.surrounding.length > 0 && (
        <SurroundingMesh
          geometries={geometries.surrounding}
          deletedSurroundingMeshes={deletedSurroundingMeshes}
        />
      )}
      {geometries.background.length > 0 && (
        <SurroundingMesh
          geometries={geometries.background}
          deletedSurroundingMeshes={deletedSurroundingMeshes}
        />
      )}

      {simulationMesh.length > 0 && <SimulationMesh meshes={simulationMesh} />}
      {selectedMesh && <HighlightedMesh meshes={selectedMesh} />}
      {simulationMesh.length > 0 && frontendState == "Results" && (
        <CustomMapControl
          middle={simulationMesh[0].middle}
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
        />
      )}
      {frontendState == "DrawPV" && (
        <DrawPVControl
          middle={simulationMesh[0].middle}
          setPVPoints={setPVPoints}
        />
      )}
      {frontendState == "DrawPV" && <Points points={pvPoints} />}

      <PVSystems
        visiblePVSystems={visiblePVSystems}
        pvPoints={pvPoints}
        setPVPoints={setPVPoints}
      />

      {simulationMesh != undefined && showTerrain && <Terrain />}
    </Canvas>
  )
}

export default Scene
