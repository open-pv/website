import { useContext } from 'react'
import * as THREE from 'three'
import { SceneContext } from '../../context'

export function HighlightedPVSystem() {
  const sceneContext = useContext(SceneContext)
  return (
    <>
      {sceneContext.selectedPVSystem.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          material={
            new THREE.MeshLambertMaterial({
              color: 'red',
              transparent: false,
            })
          }
        />
      ))}
    </>
  )
}
