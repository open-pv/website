import { useContext } from 'react'
import * as THREE from 'three'
import { SceneContext } from '../../context'

export function HighlightedMesh() {
  const sceneContext = useContext(SceneContext)
  return (
    <>
      {sceneContext.selectedMesh.map((mesh, index) => (
        <mesh
          key={index}
          geometry={mesh.geometry}
          material={
            new THREE.MeshLambertMaterial({
              color: '#2b2c40',
              transparent: false,
            })
          }
        />
      ))}
    </>
  )
}
