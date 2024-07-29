import React from "react"
import * as THREE from "three"

const SimulationMesh = ({ meshes }) => {
  return (
    <>
      {meshes.map((mesh, index) => (
        <mesh key={index + 1} geometry={mesh.geometry} name={`SimulationMesh`}>
          <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

export default SimulationMesh
