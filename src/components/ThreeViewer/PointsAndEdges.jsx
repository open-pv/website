import React, { useMemo } from "react"
import * as THREE from "three"

const PointsAndEdges = ({ points }) => {
  const pointsAndEdges = useMemo(() => {
    // Create points
    const pointMeshes = points.map((point, index) => {
      const pointGeometry = new THREE.BufferGeometry().setFromPoints([
        point.point,
      ])
      const pointMaterial = new THREE.PointsMaterial({
        color: "#333333",
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
    for (let i = 0; i < points.length - 1; i++) {
      edgePositions.push(
        points[i].point.x,
        points[i].point.y,
        points[i].point.z
      )
      edgePositions.push(
        points[i + 1].point.x,
        points[i + 1].point.y,
        points[i + 1].point.z
      )
    }
    edgeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edgePositions, 3)
    )
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: "#333333",
    })
    const edges = (
      <lineSegments geometry={edgeGeometry} material={edgeMaterial} />
    )

    return [...pointMeshes, edges]
  }, [points])

  return <>{pointsAndEdges}</>
}

export default PointsAndEdges
