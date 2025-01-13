import * as THREE from 'three'
import { mercator2meters } from './download'
import { coordinatesWebMercator } from './location'

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

export function processVegetationData(
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

  for (let y = 0; y < vegetationRaster.height; y++) {
    for (let x = 0; x < vegetationRaster.width; x++) {
      const height = vegetationRaster.data[y * vegetationRaster.width + x]

      if (height > 0) {
        // Convert from raster coordinates to simulation coordinates
        const webMercatorX =
          vegetationRaster.bbox[0] +
          (vegetationRaster.bbox[2] - vegetationRaster.bbox[0]) *
            (x / vegetationRaster.width)
        const webMercatorY =
          vegetationRaster.bbox[3] +
          (vegetationRaster.bbox[1] - vegetationRaster.bbox[3]) *
            (y / vegetationRaster.height)
        const simX = (webMercatorX - cx) * mercator2meters()
        const simY = (webMercatorY - cy) * mercator2meters()

        if ((x % 100) + (y % 100) == 0) {
          console.log(simX, simY)
        }

        // Calculate distance squared from simulation center
        const distanceSquared =
          (simX - centerX) * (simX - centerX) +
          (simY - centerY) * (simY - centerY)

        if (distanceSquared <= viewingCutoffSquared) {
          const vegGeometry = createVegetationGeometry(simX, simY, height)

          if (distanceSquared <= simulationCutoffSquared) {
            geometries.surrounding.push(vegGeometry)
          } else {
            geometries.background.push(vegGeometry)
          }
        }
      }
    }
  }

  console.log('Vegetation processing complete.')
  console.log('Surrounding geometries:', geometries.surrounding.length)
  console.log('Background geometries:', geometries.background.length)

  return geometries
}

function createVegetationGeometry(x, y, vegHeight) {
  const width = 1
  const depth = 1

  const geometry = new THREE.BoxGeometry(width, depth, 20)
    .toNonIndexed()
    .deleteAttribute('uv')
  geometry.translate(x, y, vegHeight - 10)

  return geometry
}
