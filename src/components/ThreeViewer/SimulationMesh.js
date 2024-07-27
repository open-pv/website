import * as THREE from "three"

const SimulationMesh = ({ mesh }) => {
  return (
    <mesh geometry={mesh.geometry} name="SimulationMesh">
      <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default SimulationMesh
