import * as THREE from "three"

export function processGeometries(geometries, simulationCenter, shadingCutoff) {
  // TODO: This is a hand-wavy way of converting real-world meters to WebMercator meters
  // in mid-latitudes need to do this more accurately using the latitude of the center point

  // The geometries from the input are centered around the simulation geometry
  console.log("simulationCenter", simulationCenter)
  console.log("shadingCutoff", shadingCutoff)

  const cutoff2 = shadingCutoff * shadingCutoff
  let minDist = Infinity
  let indexOfSimulationInSurrounding = 0
  let simulation = []
  let surrounding = []
  let background = []

  for (let geom of geometries) {
    geom.computeBoundingBox()
    let center = new THREE.Vector3()
    geom.boundingBox.getCenter(center)
    const d2 =
      (center.x - simulationCenter.x) ** 2 +
      (center.y - simulationCenter.y) ** 2
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
  simulation.forEach((geom, index) => (geom.name = `simulation-${index}`))
  surrounding.forEach((geom, index) => (geom.name = `surrounding-${index}`))
  background.forEach((geom, index) => (geom.name = `background-${index}`))

  return { simulation, surrounding, background }
}
