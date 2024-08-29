import * as THREE from "three"

const SurroundingMesh = ({ geometries, prefix }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} name={`${prefix}-${index}`}>
          <meshLambertMaterial
            vertexColors={false}
            color={0xab9980}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export default SurroundingMesh
