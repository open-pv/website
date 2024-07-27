import { useFrame } from "@react-three/fiber"
import React, { useRef } from "react"
import * as THREE from "three"
import TextSprite from "./TextSprite"

const PVSystem = ({ geometry, annualYield, area }) => {
  const textRef = useRef()

  const center = calculateCenter(geometry.attributes.position.array)
  console.log("center", center)

  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <>
      <mesh geometry={geometry} />
      <meshStandardMaterial
        vertexColors={false}
        color="navy"
        metalness={0}
        opacity={0.5}
      />

      <TextSprite
        text={`Jahresertrag: ${Math.round(annualYield).toLocaleString(
          "de"
        )} kWh pro Jahr\nFläche: ${area.toPrecision(3)}m²`}
        position={center}
      />
    </>
  )
}

const calculateCenter = (points) => {
  const length = points.length / 3
  const sum = points.reduce(
    (acc, value, index) => {
      acc[index % 3] += value
      return acc
    },
    [0, 0, 0]
  )
  return new THREE.Vector3(sum[0] / length, sum[1] / length, sum[2] / length)
}

export default PVSystem
