import * as THREE from "three"

const SimulationMesh = ({ mesh }) => {
  return (
    <mesh geometry={mesh.geometry}>
      <meshStandardMaterial
        vertexColors={false}
        color={mesh.color}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default SimulationMesh
