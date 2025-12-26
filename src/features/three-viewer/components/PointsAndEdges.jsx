import { useContext, useMemo } from 'react'
import * as THREE from 'three'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'

const PointsAndEdges = () => {
  const sceneContext = useContext(SceneContext)
  const pointsAndEdges = useMemo(() => {
    // Create points
    const pointMeshes = sceneContext.pvPoints.map((point, index) => {
      const pointGeometry = new THREE.BufferGeometry().setFromPoints([
        point.point,
      ])
      const pointMaterial = new THREE.PointsMaterial({
        color: '#333333',
        size: 10,
        sizeAttenuation: false,
      })
      return (
        <points
          key={`point-${index}`}
          geometry={pointGeometry}
          material={pointMaterial}
        />
      )
    })

    // Create edges
    const edgeGeometry = new THREE.BufferGeometry()
    const edgePositions = []
    for (let i = 0; i < sceneContext.pvPoints.length - 1; i++) {
      edgePositions.push(
        sceneContext.pvPoints[i].point.x,
        sceneContext.pvPoints[i].point.y,
        sceneContext.pvPoints[i].point.z,
      )
      edgePositions.push(
        sceneContext.pvPoints[i + 1].point.x,
        sceneContext.pvPoints[i + 1].point.y,
        sceneContext.pvPoints[i + 1].point.z,
      )
    }
    edgeGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(edgePositions, 3),
    )
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: '#333333',
    })
    const edges = (
      <lineSegments geometry={edgeGeometry} material={edgeMaterial} />
    )

    return [...pointMeshes, edges]
  }, [sceneContext.pvPoints])

  return <>{pointsAndEdges}</>
}

export default PointsAndEdges
