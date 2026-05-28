import TextSprite from '@/features/three-viewer/components/TextSprite'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import { createPVSystemData } from '@/features/three-viewer/core/pvSystemCreation'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'

/**
 * Wrapper function for backward compatibility.
 * Creates a PV system and updates state.
 *
 * @param {Object} params
 * @param {Function} params.setPVSystems           - state setter for the list of PV systems
 * @param {Array}    params.pvPoints               - array of points the user clicked (with normal vectors)
 * @param {Function} params.setPVPoints            - state setter to clear points after creation
 * @param {Array}    params.simulatedBuildings     - array of building objects that contain the simulation mesh
 */
export function createPVSystem({
  setPVSystems,
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
}

/**
 * Pure rendering component for a single PV system.
 * Displays the PV panel mesh and label with yield information.
 *
 * @param {Object} props
 * @param {Object} props.pvSystem - PV system object with geometry and yield data
 */
export const PVSystem = ({ pvSystem }) => {
  const { setPVSystems, setIsOpenSavingCalculation } = useContext(SceneContext)
  const { t, i18n } = useTranslation()

  const deleteSelf = () =>
    setPVSystems((prev) => prev.filter((s) => s.id !== pvSystem.id))

  const center = new THREE.Vector3(
    pvSystem.center.x,
    pvSystem.center.y,
    pvSystem.center.z,
  )

  const material = new THREE.MeshStandardMaterial({
    color: '#2b2c40',
    transparent: true,
    opacity: 0.5,
    metalness: 1,
    side: THREE.DoubleSide,
  })
  return (
    <>
      <mesh geometry={pvSystem.geometry} material={material} />

      <TextSprite
        text={`${t('yieldPerYear')}: ${Math.round(pvSystem.annualYield).toLocaleString(i18n.language)} kWh\n${t('possibleKWp')}: ${pvSystem.installedKWp.toLocaleString(i18n.language, { maximumSignificantDigits: 3 })} kWp`}
        position={center}
        buttons={[
          {
            label: t('details'),
            onClick: () => setIsOpenSavingCalculation(true),
          },
          { label: t('delete'), onClick: deleteSelf },
        ]}
      />
    </>
  )
}
