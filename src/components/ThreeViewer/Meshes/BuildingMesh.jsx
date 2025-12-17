import * as THREE from 'three'
/**
 * Renders building.
 *
 * - If `building.mesh` exists, it is rendered as‑is.
 * - Otherwise a simple `<mesh>` with the supplied geometry and a single
 *   Lambert material is created.
 */
export const BuildingMesh = ({ building }) => {
  if (building.type == 'simulation')
    return <primitive key={building.id} object={building.mesh} dispose={null} />

  // Fallback: create a basic mesh from the geometry for surrounding buildings.
  return (
    <mesh key={building.id} geometry={building.geometry}>
      <meshLambertMaterial
        vertexColors={false}
        color={0xc4b69f}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
