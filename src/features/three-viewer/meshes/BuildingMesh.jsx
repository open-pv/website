import * as THREE from 'three'
/** @typedef {import('@/types/building').Building} Building */

/**
 * Renders a single building.
 * Simulation buildings return null — their mesh is rendered once via the
 * scene-level SimulationResult in Scene.jsx.
 *
 * @param {Object}   props
 * @param {Building} props.building
 */
export const BuildingMesh = ({ building }) => {
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
