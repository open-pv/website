import { useContext } from 'react'
import * as THREE from 'three'
import { SceneContext } from '../../context'

const SimulationMesh = () => {
  const sceneContext = useContext(SceneContext)
  return (
    <>
      {sceneContext.simulationMeshes.map((mesh, index) => (
        <mesh key={index} geometry={mesh.geometry}>
          <meshLambertMaterial vertexColors={true} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

export default SimulationMesh
