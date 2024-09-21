import React from "react"
import * as THREE from "three"

export function HighlightedPVSystem({ meshes }) {
  return (
    <>
      {meshes.map((mesh, index) => (
        <mesh
          key={index}
          geometry={mesh.geometry}
          material={
            new THREE.MeshLambertMaterial({
              color: "red",
              transparent: false,
            })
          }
        />
      ))}
    </>
  )
}
