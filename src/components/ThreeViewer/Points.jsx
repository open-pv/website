import React, { useMemo } from "react"
import * as THREE from "three"

const Points = ({ points }) => {
  const pointMeshes = useMemo(() => {
    return points.map((point, index) => {
      const pointGeometry = new THREE.BufferGeometry().setFromPoints([
        point.point,
      ])
      const pointMaterial = new THREE.PointsMaterial({
        color: "#333333",
        size: 5,
        sizeAttenuation: false,
      })
      return (
        <points key={index} geometry={pointGeometry} material={pointMaterial} />
      )
    })
  }, [points])

  return <>{pointMeshes}</>
}

export default Points