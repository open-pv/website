import React from 'react'
import * as THREE from 'three'

export function HighlightedPVSystem({ geometries }) {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          material={
            new THREE.MeshLambertMaterial({
              color: 'red',
              transparent: false,
            })
          }
        />
      ))}
    </>
  )
}
