import React, { useRef } from "react"
import { Canvas } from "react-three-fiber"

import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import BackgroundMesh from "./BackgroundMesh"
import CustomMapControl from "./CustomMapControl"
import DrawPVControl from "./DrawPVControl"
import SimulationMesh from "./SimulationMesh"
import SurroundingMesh from "./SurroundingMesh"
import Terrain from "./Terrain"

const Scene = ({ simulationMesh, geometries, showTerrain, frontendState }) => {
  console.log("SceneGeoms", geometries)
  console.log("SceneSimulationMesh", simulationMesh)
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
      {geometries.surrounding.length > 0 && (
        <SurroundingMesh
          geometry={BufferGeometryUtils.mergeGeometries(geometries.surrounding)}
        />
      )}
      {geometries.background.length > 0 && (
        <BackgroundMesh
          geometry={BufferGeometryUtils.mergeGeometries(geometries.background)}
        />
      )}
      {simulationMesh != undefined && <SimulationMesh mesh={simulationMesh} />}
      {simulationMesh != undefined && frontendState == "Results" && (
        <CustomMapControl middle={simulationMesh.middle} />
      )}
      {frontendState == "DrawPV" && (
        <DrawPVControl middle={simulationMesh.middle} />
      )}
      {simulationMesh != undefined && showTerrain && <Terrain />}
    </Canvas>
  )
}

export default Scene
