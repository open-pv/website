import * as THREE from "three"

export function processGeometries(geometries) {
  // TODO: This is a hand-wavy way of converting real-world meters to WebMercator meters
  // in mid-latitudes need to do this more accurately using the latitude of the center point
  let radius
  window.numRadiusSimulation
    ? (radius = window.numRadiusSimulation)
    : (radius = 80)

  const cutoff2 = radius * radius
  let minDist = Infinity
  let indexOfSimulationInSurrounding = 0
  let simulation = []
  let surrounding = []
  let background = []

  for (let geom of geometries) {
    geom.computeBoundingBox()
    let center = new THREE.Vector3()
    geom.boundingBox.getCenter(center)
    const d2 = center.x * center.x + center.y * center.y
    if (d2 <= cutoff2) {
      if (d2 < minDist) {
        simulation = [geom]
        minDist = d2
        indexOfSimulationInSurrounding = surrounding.length
      }
      surrounding.push(geom)
    } else {
      background.push(geom)
    }
  }
  surrounding.splice(indexOfSimulationInSurrounding, 1)
  console.log("Surrounding", surrounding)

  return { simulation, surrounding, background }
}
