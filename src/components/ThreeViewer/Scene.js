import { MapControls, OrbitControls } from "@react-three/drei"
import React, { useEffect, useState } from "react"
import { Canvas } from "react-three-fiber"

import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import BackgroundMesh from "./BackgroundMesh"
import CustomMapControl from "./CustomMapControl"
import SimulationMesh from "./SimulationMesh"
import SurroundingMesh from "./SurroundingMesh"

const Scene = ({ simulationMesh, geometries }) => {
  console.log("SceneGeoms", geometries)
  console.log("SceneSimulationMesh", simulationMesh)

  return (
    <Canvas>
      <ambientLight />
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
    </Canvas>
  )
}

export default Scene
//<mesh geometry={geometries.surrounding} material={surroundingMaterial} />
