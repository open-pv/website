import React, { useRef, useState } from "react"
import { Canvas } from "react-three-fiber"

import CustomMapControl from "./Controls/CustomMapControl"
import DrawPVControl from "./Controls/DrawPVControl"
import BackgroundMesh from "./Meshes/BackgroundMesh"
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
}) => {
  const [pvPoints, setPVPoints] = useState([])
  const [selectedMesh, setSelectedMesh] = useState(null)
  window.setPVPoints = setPVPoints
  const position = [
    simulationMesh.middle.x,
    simulationMesh.middle.y - 40,
    simulationMesh.middle.z + 80,
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
        <SurroundingMesh geometries={geometries.surrounding} />
      )}
      {geometries.background.length > 0 && (
        <BackgroundMesh geometries={geometries.background} />
      )}

      {simulationMesh != undefined && <SimulationMesh mesh={simulationMesh} />}
      {selectedMesh && (
        <HighlightedMesh
          geometry={selectedMesh.geometry}
          material={selectedMesh.material}
        />
      )}
      {simulationMesh != undefined && frontendState == "Results" && (
        <CustomMapControl
          middle={simulationMesh.middle}
          setSelectedMesh={setSelectedMesh}
        />
      )}
      {frontendState == "DrawPV" && (
        <DrawPVControl
          middle={simulationMesh.middle}
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
