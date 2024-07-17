import * as THREE from "three"

const SimulationMesh = ({ mesh }) => {
  return (
    <mesh geometry={mesh.geometry}>
      <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default SimulationMesh
