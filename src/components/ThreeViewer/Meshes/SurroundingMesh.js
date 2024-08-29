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
              <meshLambertMaterial
                vertexColors={false}
                color={0xab9980}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
      )}
    </>
  )
}

export default SurroundingMesh
