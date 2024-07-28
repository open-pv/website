import { Edges } from "@react-three/drei"
import React from "react"

export function HighlightedMesh({ geometry, material }) {
  return (
    <mesh geometry={geometry} material={material}>
      <Edges color="orange" lineWidth={5} />
    </mesh>
  )
}
