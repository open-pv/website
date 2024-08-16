import * as THREE from "three"

const SurroundingMesh = ({ geometries, deletedSurroundingMeshes }) => {
  return (
    <>
      {geometries.map(
        (geometry, index) =>
          !deletedSurroundingMeshes.includes(`SurroundingMesh-${index}`) && (
            <mesh
              key={index}
              geometry={geometry}
              name={`SurroundingMesh-${index}`}
            >
              <meshStandardMaterial
                vertexColors={false}
                color={0xd1bea4}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
      )}
    </>
  )
}

export default SurroundingMesh
