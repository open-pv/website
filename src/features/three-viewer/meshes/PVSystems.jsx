import TextSprite from '@/features/three-viewer/components/TextSprite'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import { createPVSystemData } from '@/features/three-viewer/core/pvSystemCreation'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
/** @typedef {import('@/types/pvSystem').PVSystem} PVSystem */

/**
 * Creates a PV system and updates state.
 *
 * @param {Object}                  params
 * @param {Function}                params.setPVSystems    - state setter for the list of PV systems
 * @param {Array}                   params.pvPoints        - array of points the user clicked (with normal vectors)
 * @param {Function}                params.setPVPoints     - state setter to clear points after creation
 * @param {import('three').Mesh}    params.simulationMesh  - the scene-level simulation mesh
 */
export function createPVSystem({
  setPVSystems,
  pvPoints,
  setPVPoints,
  simulationMesh,
}) {
  const pvSystemData = createPVSystemData({
    pvPoints,
    simulationMesh,
  })

  if (!pvSystemData) {
    return
  }

  setPVSystems((prevSystems) => [...prevSystems, pvSystemData])
  setPVPoints([])
}

/**
 * Pure rendering component for a single PV system.
 *
 * @param {Object}   props
 * @param {PVSystem} props.pvSystem
 */
export const PVSystem = ({ pvSystem }) => {
  const { setPVSystems, setIsOpenSavingCalculation, setSelectedPVSystem } =
    useContext(SceneContext)
  const { t, i18n } = useTranslation()

  const deleteSelf = () =>
    setPVSystems((prev) => prev.filter((s) => s.id !== pvSystem.id))

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
        position={pvSystem.center}
        buttons={[
          {
            label: t('details'),
            onClick: () => {
              setSelectedPVSystem(pvSystem)
              setIsOpenSavingCalculation(true)
            },
          },
          { label: t('delete'), onClick: deleteSelf },
        ]}
      />
    </>
  )
}
