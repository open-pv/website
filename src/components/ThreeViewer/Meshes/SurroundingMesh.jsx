import * as THREE from 'three'

/**
 * Renders a collection of building geometries.
 * The component receives an array of building objects (each with a `geometry` field)
 * and creates a mesh for each geometry.
 */
const SurroundingMesh = ({ buildings }) => {
  return (
    <>
      {buildings.map((building) => (
        <mesh key={building.id} geometry={building.geometry}>
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
