import React, { useRef, useState } from "react"
import { Canvas } from "react-three-fiber"

import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import BackgroundMesh from "./BackgroundMesh"
import CustomMapControl from "./CustomMapControl"
import DrawPVControl from "./DrawPVControl"
import Points from "./Points"
import PVSystems from "./PVSystems"
import SimulationMesh from "./SimulationMesh"
import SurroundingMesh from "./SurroundingMesh"
import Terrain from "./Terrain"

const Scene = ({
  simulationMesh,
  geometries,
  showTerrain,
  frontendState,
  visiblePVSystems,
}) => {
  const [pvPoints, setPVPoints] = useState([])
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
      <directionalLight intensity={2} position={[0, 1, -1]} />
      {true && geometries.surrounding.length > 0 && (
        <SurroundingMesh
          geometry={BufferGeometryUtils.mergeGeometries(geometries.surrounding)}
        />
      )}
      {true && geometries.background.length > 0 && (
        <BackgroundMesh
          geometry={BufferGeometryUtils.mergeGeometries(geometries.background)}
        />
      )}
      {true && simulationMesh != undefined && (
        <SimulationMesh mesh={simulationMesh} />
      )}
      {simulationMesh != undefined && frontendState == "Results" && (
        <CustomMapControl middle={simulationMesh.middle} />
      )}
      {frontendState == "DrawPV" && (
        <DrawPVControl
          middle={simulationMesh.middle}
          setPVPoints={setPVPoints}
        />
      )}
      {frontendState == "DrawPV" && <Points points={pvPoints} />}
      {frontendState == "DrawPV" && (
        <PVSystems
          visiblePVSystems={visiblePVSystems}
          pvPoints={pvPoints}
          setPVPoints={setPVPoints}
        />
      )}
      {simulationMesh != undefined && showTerrain && <Terrain />}
    </Canvas>
  )
}

export default Scene
