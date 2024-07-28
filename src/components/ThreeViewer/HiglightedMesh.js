import { Edges } from "@react-three/drei"
import React from "react"
import * as THREE from "three"

export function HighlightedMesh({ geometry, material }) {
  return (
    <mesh
      geometry={geometry}
      material={
        new THREE.MeshStandardMaterial({
          color: "#2b2c40",
          transparent: false,
        })
      }
    >
      <Edges color="orange" lineWidth={5} />
    </mesh>
  )
}
