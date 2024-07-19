import React from "react"
import { Canvas } from "react-three-fiber"

import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import BackgroundMesh from "./BackgroundMesh"
import CustomMapControl from "./CustomMapControl"
import SimulationMesh from "./SimulationMesh"
import SurroundingMesh from "./SurroundingMesh"
import Terrain from "./Terrain"

const Scene = ({ simulationMesh, geometries }) => {
  console.log("SceneGeoms", geometries)
  console.log("SceneSimulationMesh", simulationMesh)

  return (
    <Canvas>
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
      {simulationMesh != undefined && (
        <CustomMapControl middle={simulationMesh.middle} />
      )}
      {simulationMesh != undefined && <Terrain />}
    </Canvas>
  )
}

export default Scene
//<mesh geometry={geometries.surrounding} material={surroundingMaterial} />
