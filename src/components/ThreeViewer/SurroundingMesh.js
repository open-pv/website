import * as THREE from "three"

const SurroundingMesh = ({ geometry }) => {
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        vertexColors={false}
        color={0xd1bea4}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default SurroundingMesh
