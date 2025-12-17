import * as THREE from 'three'

/**
 * Process an array of building objects and assign a `type` to each one.
 *
 * Input:
 *   buildings: [
 *     { id: Number, type: 'background', geometry: THREE.BufferGeometry },
 *     ...
 *   ]
 *
 * The function calculates the centre of each geometry, determines its distance
 * from the simulation centre, and updates the `type` field to one of:
 *   - 'simulation'  (inside the simulation radius)
 *   - 'surrounding' (inside the shading cutoff but outside the simulation radius)
 *   - 'background'  (outside the shading cutoff)
 *
 * The same building objects are returned (mutated in‑place) so that a single
 * state can hold all building information.
 */
export function processGeometries(buildings, simulationCenter, shadingCutoff) {
  const simulationRadius = 10
  const simulationRadius2 = simulationRadius * simulationRadius
  const cutoff2 = shadingCutoff * shadingCutoff

  // Step 1: compute bounding boxes and centre points for each building
  for (let b of buildings) {
    b.geometry.computeBoundingBox()
    const center = new THREE.Vector3()
    b.geometry.boundingBox.getCenter(center)
    b._center = center // store temporarily for later distance checks
  }

  // Step 2 – assign type based on distance from the simulation centre
  for (let b of buildings) {
    const d2 =
      (b._center.x - simulationCenter.x) ** 2 +
      (b._center.y - simulationCenter.y) ** 2

    if (d2 <= simulationRadius2) {
      b.type = 'simulation'
    } else if (d2 <= cutoff2) {
      b.type = 'surrounding'
    } else {
      b.type = 'background'
    }
    delete b._center
  }
  return buildings
}
