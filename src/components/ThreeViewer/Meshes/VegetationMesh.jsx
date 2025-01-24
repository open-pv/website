import React, { useMemo } from 'react'
import * as THREE from 'three'

const VegetationMesh = ({ geometries }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshLambertMaterial
            vertexColors={false}
            color='#3C9000'
            shininess={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export default VegetationMesh
