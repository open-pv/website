import * as THREE from 'three'

export function processGeometries(geometries, simulationCenter, shadingCutoff) {
  console.log('simulationCenter', simulationCenter)
  console.log('shadingCutoff', shadingCutoff)

  const simulationRadius = 10 // 10 meters radius for simulation
  const simulationRadius2 = simulationRadius * simulationRadius
  const cutoff2 = shadingCutoff * shadingCutoff

  let minDist = Infinity
  let closestGeometryCenter = new THREE.Vector3()

  // Step 1: Find the minimum distance and the center of the closest geometry
  for (let geom of geometries) {
    geom.computeBoundingBox()
    let center = new THREE.Vector3()
    geom.boundingBox.getCenter(center)
    const d2 =
      (center.x - simulationCenter.x) ** 2 +
      (center.y - simulationCenter.y) ** 2
    if (d2 < minDist) {
      minDist = d2
      closestGeometryCenter.copy(center)
    }
  }

  // Step 2: Recenter the coordinates
  const offset = new THREE.Vector3().subVectors(
    closestGeometryCenter,
    simulationCenter,
  )

  let simulation = []
  let surrounding = []
  let background = []

  // Steps 3 and 4: Categorize geometries based on the new center
  for (let geom of geometries) {
    let center = new THREE.Vector3()
    geom.boundingBox.getCenter(center)
    center.sub(offset) // Recenter

    const d2 = center.x * center.x + center.y * center.y

    if (d2 <= simulationRadius2) {
      simulation.push(geom)
    } else if (d2 <= cutoff2) {
      surrounding.push(geom)
    } else {
      background.push(geom)
    }
  }

  simulation.forEach((geom, index) => (geom.name = `simulation-${index}`))
  surrounding.forEach((geom, index) => (geom.name = `surrounding-${index}`))
  background.forEach((geom, index) => (geom.name = `background-${index}`))

  return { simulation, surrounding, background }
}
