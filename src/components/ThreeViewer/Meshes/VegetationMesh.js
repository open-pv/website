import * as THREE from "three"

const VegetationMesh = ({ geometries }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshLambertMaterial
            vertexColors={false}
            color={"green"}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export default VegetationMesh
