import * as THREE from 'three'
import { mercator2meters } from './download'
import { coordinatesWebMercator } from './location'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { SONNY_DEM } from './elevation'

export async function processVegetationData(
  vegetationGrid,
  simulationCenter,
  vegetationSimulationCutoff,
  vegetationViewingCutoff,
) {
  const simulationCutoffSquared =
    vegetationSimulationCutoff * vegetationSimulationCutoff
  const viewingCutoffSquared = vegetationViewingCutoff * vegetationViewingCutoff

  // Ensure simulationCenter has x and y properties
  const centerX = simulationCenter.x || 0
  const centerY = simulationCenter.y || 0

  let surroundingTriangles = []
  let backgroundTriangles = []
  let surroundingNormals = []
  let backgroundNormals = []

  for (let y = 0; y < vegetationGrid.length - 1; y++) {
    for (let x = 0; x < vegetationGrid.length - 1; x++) {
      const p00 = vegetationGrid[y][x]
      const p10 = vegetationGrid[y][x + 1]
      const p01 = vegetationGrid[y + 1][x]
      const p11 = vegetationGrid[y + 1][x + 1]

      // Triangle candidates
      const tris = [
        [p10, p00, p01],
        [p10, p01, p11],
      ]
      for (let [a, b, c] of tris) {
        // If all heights are 0, don't render triangle
        if (a.point[2] == 0 && b.point[2] == 0 && c.point[2] == 0) {
          continue
        }
        // Fill 0 values with actual elevation at that point
        for (let pt of [a, b, c]) {
          if (pt.point[2] == 0) {
            const pt3d = await SONNY_DEM.toPoint3D(pt.point[0], pt.point[1])
            pt.point[2] = pt3d.point[2]
          }
        }

        const mx = (a.point[0] + b.point[0] + c.point[0]) / 3
        const my = (a.point[1] + b.point[1] + c.point[1]) / 3

        const d2 =
          (centerX - mx) * (centerX - mx) + (centerY - my) * (centerY - my)
        if (d2 <= viewingCutoffSquared) {
          if (d2 <= simulationCutoffSquared) {
            surroundingTriangles.push(...a.point, ...b.point, ...c.point)
            surroundingNormals.push(...a.normal, ...b.normal, ...c.normal)
          } else {
            backgroundTriangles.push(...a.point, ...b.point, ...c.point)
            backgroundNormals.push(...a.normal, ...b.normal, ...c.normal)
          }
        }
      }
    }
  }

  const geometries = {
    surrounding: [],
    background: [],
  }

  if (surroundingTriangles.length > 0) {
    let surroundingGeom = new THREE.BufferGeometry()
    const surroundingPos = new THREE.BufferAttribute(
      new Float32Array(surroundingTriangles),
      3,
    )
    const surroundingNor = new THREE.BufferAttribute(
      new Float32Array(surroundingNormals),
      3,
    )
    surroundingGeom.setAttribute('position', surroundingPos)
    surroundingGeom.setAttribute('normal', surroundingNor)
    geometries.surrounding.push(surroundingGeom)
  }

  if (backgroundTriangles.length > 0) {
    let backgroundGeom = new THREE.BufferGeometry()
    const backgroundPos = new THREE.BufferAttribute(
      new Float32Array(backgroundTriangles),
      3,
    )
    const backgroundNor = new THREE.BufferAttribute(
      new Float32Array(backgroundNormals),
      3,
    )
    backgroundGeom.setAttribute('position', backgroundPos)
    backgroundGeom.setAttribute('normal', backgroundNor)
    geometries.background.push(backgroundGeom)
  }

  return geometries
}
