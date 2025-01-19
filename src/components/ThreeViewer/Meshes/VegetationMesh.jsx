import React, { useMemo } from 'react'
import * as THREE from 'three'

const vegetationColors = [
  '#27AD6B', // Light green
  '#2DBE76', // mint
  '#33CC80', //dull green
]

const VegetationMesh = ({ geometries }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshLambertMaterial
            vertexColors={false}
            color='#27AD6B'
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export default VegetationMesh
