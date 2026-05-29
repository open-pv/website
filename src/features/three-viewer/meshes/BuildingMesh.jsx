import * as THREE from 'three'
/**
 * Renders building.
 *
 * - If `building.type` == "simulation", it is rendered as‑is.
 * - Otherwise a simple `<mesh>` with the supplied geometry and a single
 *   Lambert material is created.
 */
export const BuildingMesh = ({ building }) => {
  // Simulation buildings are rendered via the scene-level SimulationResult mesh in Scene.jsx
  if (building.type == 'simulation') return null

  return (
    <mesh geometry={building.geometry}>
      <meshLambertMaterial
        vertexColors={false}
        color={0xc4b69f}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
