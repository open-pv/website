import * as THREE from 'three'
import { mercator2meters } from './download'
import { coordinatesWebMercator } from './location'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { ElevationManager } from './elevation'

export function processVegetationHeightmapData(heightmapData) {
  if (!heightmapData || !heightmapData.bbox || !heightmapData.data) {
    console.error('Invalid heightmap data, missing bbox or data')
    return null
  }

  return {
    ...heightmapData,
    data: new Float32Array(heightmapData.data),
  }
}

export async function processVegetationData(
  vegetationRaster,
  simulationCenter,
  vegetationSimulationCutoff,
  vegetationViewingCutoff,
) {
  console.log('Processing vegetation data...')

  if (!vegetationRaster || !vegetationRaster.data) {
    console.error('Invalid vegetation raster data')
    return { surrounding: [], background: [] }
  }

  console.log(
    'Vegetation raster dimensions:',
    vegetationRaster.width,
    'x',
    vegetationRaster.height,
  )
  console.log('Vegetation raster bbox:', vegetationRaster.bbox)

  const geometries = {
    surrounding: [],
    background: [],
  }

  const [cx, cy] = coordinatesWebMercator

  const simulationCutoffSquared =
    vegetationSimulationCutoff * vegetationSimulationCutoff
  const viewingCutoffSquared = vegetationViewingCutoff * vegetationViewingCutoff

  // Ensure simulationCenter has x and y properties
  const centerX = simulationCenter.x || 0
  const centerY = simulationCenter.y || 0

  const x0 = vegetationRaster.bbox[0] - cx
  const dx =
    (vegetationRaster.bbox[2] - vegetationRaster.bbox[0]) /
    vegetationRaster.width
  const y0 = vegetationRaster.bbox[3] - cy
  const dy =
    (vegetationRaster.bbox[1] - vegetationRaster.bbox[3]) /
    vegetationRaster.height

  let surroundingTriangles = []
  let backgroundTriangles = []
  let surroundingNormals = []
  let backgroundNormals = []

  for (let y = 0; y < vegetationRaster.height - 1; y++) {
    for (let x = 0; x < vegetationRaster.width - 1; x++) {
      const w = vegetationRaster.width
      const h00 = vegetationRaster.data[y * w + x]
      const h10 = vegetationRaster.data[y * w + x + 1]
      const h01 = vegetationRaster.data[(y + 1) * w + x]
      const h11 = vegetationRaster.data[(y + 1) * w + x + 1]

      const sx0 = (x0 + dx * x) * mercator2meters()
      const sx1 = (x0 + dx * (x + 1)) * mercator2meters()
      const sy0 = (y0 + dy * y) * mercator2meters()
      const sy1 = (y0 + dy * (y + 1)) * mercator2meters()

      // Triangle candidates
      const tris = [
        [sx1, sy0, h10, sx0, sy0, h00, sx0, sy1, h01],
        [sx1, sy0, h10, sx0, sy1, h01, sx1, sy1, h11],
      ]
      for (let tri of tris) {
        // If all heights are 0, don't render triangle
        if (tri[2] == 0 && tri[5] == 0 && tri[8] == 0) {
          continue
        }
        // Fill 0 values with actual elevation at that point
        for (let v of [0, 3, 6]) {
          if (tri[v + 2] == 0) {
            const x = tri[v + 0] / mercator2meters() + cx
            const y = tri[v + 1] / mercator2meters() + cy
            const pt3d = await ElevationManager.toPoint3D(x, y)
            const height = pt3d.point[2]
            tri[v + 2] = height
          }
        }

        const mx = (tri[0] + tri[3] + tri[6]) / 3
        const my = (tri[1] + tri[4] + tri[7]) / 3

        const v1 = new THREE.Vector3(
          tri[3] - tri[0],
          tri[4] - tri[1],
          tri[5] - tri[2],
        )
        const v0 = new THREE.Vector3(
          tri[6] - tri[0],
          tri[7] - tri[1],
          tri[8] - tri[2],
        )
        v0.cross(v1)
        v0.normalize()
        const normal = [v0.x, v0.y, v0.z, v0.x, v0.y, v0.z, v0.x, v0.y, v0.z]

        const d2 =
          (centerX - mx) * (centerX - mx) + (centerY - my) * (centerY - my)
        if (d2 <= viewingCutoffSquared) {
          if (d2 <= simulationCutoffSquared) {
            surroundingTriangles = surroundingTriangles.concat(tri)
            surroundingNormals = surroundingNormals.concat(normal)
          } else {
            backgroundTriangles = backgroundTriangles.concat(tri)
            backgroundNormals = backgroundNormals.concat(normal)
          }
        }
      }
    }
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
