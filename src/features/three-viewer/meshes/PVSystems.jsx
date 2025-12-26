import TextSprite from '@/features/three-viewer/components/TextSprite'
import { createPVSystemData } from '@/features/three-viewer/core/pvSystemCreation'
import { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'

/**
 * Wrapper function for backward compatibility.
 * Creates a PV system and updates state.
 *
 * @param {Object} params
 * @param {Function} params.setPVSystems           - state setter for the list of PV systems
 * @param {Function} params.setSelectedPVSystem    - state setter for the currently selected PV system
 * @param {Array}    params.pvPoints               - array of points the user clicked (with normal vectors)
 * @param {Function} params.setPVPoints            - state setter to clear points after creation
 * @param {Array}    params.simulatedBuildings     - array of building objects that contain the simulation mesh
 */
export function createPVSystem({
  setPVSystems,
  setSelectedPVSystem,
  pvPoints,
  setPVPoints,
  simulatedBuildings,
}) {
  const pvSystemData = createPVSystemData({
    pvPoints,
    simulatedBuildings,
  })

  if (!pvSystemData) {
    return
  }

  setPVSystems((prevSystems) => [...prevSystems, pvSystemData])
  setPVPoints([])
  setSelectedPVSystem([pvSystemData])
}

/**
 * Pure rendering component for a single PV system.
 * Displays the PV panel mesh and label with yield information.
 *
 * @param {Object} props
 * @param {Object} props.pvSystem - PV system object with geometry and yield data
 * @param {boolean} props.highlighted - Whether this PV system is highlighted/selected
 */
export const PVSystem = ({ pvSystem, highlighted = false }) => {
  const textRef = useRef()

  // Use pre-computed center instead of calculating on every render
  const center = new THREE.Vector3(
    pvSystem.center.x,
    pvSystem.center.y,
    pvSystem.center.z,
  )

  // Update text sprite rotation to face camera
  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion)
    }
  })

  const material = highlighted
    ? new THREE.MeshLambertMaterial({
        color: 'red',
        transparent: false,
      })
    : new THREE.MeshStandardMaterial({
        color: '#2b2c40',
        transparent: true,
        opacity: 0.5,
        metalness: 1,
        side: THREE.DoubleSide,
      })

  return (
    <>
      <mesh geometry={pvSystem.geometry} material={material} />

      {!highlighted && (
        <TextSprite
          ref={textRef}
          text={`Jahresertrag: ${Math.round(
            pvSystem.annualYield,
          ).toLocaleString(
            'de',
          )} kWh pro Jahr\nFläche: ${pvSystem.totalArea.toPrecision(3)}m²`}
          position={center}
        />
      )}
    </>
  )
}
