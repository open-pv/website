import React from "react"
import * as THREE from "three"

export function HighlightedMesh({ meshes }) {
  return (
    <>
      {meshes.map((mesh, index) => (
        <mesh
          key={index}
          geometry={mesh.geometry}
          material={
            new THREE.MeshLambertMaterial({
              color: "#2b2c40",
              transparent: false,
            })
          }
        />
      ))}
    </>
  )
}
