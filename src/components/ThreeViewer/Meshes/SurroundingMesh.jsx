import * as THREE from 'three'

const SurroundingMesh = ({ geometries }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshLambertMaterial
            vertexColors={false}
            color={0xc4b69f}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export default SurroundingMesh
