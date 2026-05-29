import { ShadingScene, colormaps } from '@openpv/simshady'
import * as THREE from 'three'
import { c0, c1, c2 } from '@/constants/colors'
import {
  createSkydomeURL,
  downloadBuildings,
} from '@/features/simulation/core/download'
import { VEGETATION_DEM } from '@/features/simulation/core/elevation'
import { coordinatesWebMercator } from '@/features/simulation/core/location'
import { processGeometries } from '@/features/simulation/core/preprocessing'
import { processVegetationData } from '@/features/simulation/core/processVegetationTiffs'

/**
 * @param {Object} location
 * @param {Object} [options]
 * @param {function(number, number): void} [options.onProgress]
 * @returns {Promise<import('@/types/scene').SimulationOutput|null>}
 */
export async function mainSimulation(location, { onProgress } = {}) {
  // Clear previous attributions if any
  if (window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location === 'undefined' || location == null) {
    return null
  }

  const { buildings: buildingObjects, federalState } =
    await downloadBuildings(location)
  processGeometries(buildingObjects, new THREE.Vector3(0, 0, 0), 80)

  const simulationBuildings = buildingObjects.filter(
    (b) => b.type === 'simulation',
  )
  if (simulationBuildings.length === 0) {
    return null
  }

  const scene = new ShadingScene()
  buildingObjects
    .filter((b) => b.type === 'simulation')
    .forEach((b) => scene.addSimulationGeometry(b.geometry))

  buildingObjects
    .filter((b) => b.type === 'surrounding')
    .forEach((b) => scene.addShadingGeometry(b.geometry))

  scene.addColorMap(
    colormaps.interpolateThreeColors({ c0: c0, c1: c1, c2: c2 }),
  )

  const irradianceUrl = createSkydomeURL(location.lat, location.lon)
  await scene.addSolarIrradianceFromURL(irradianceUrl)

  const vegetation = { surrounding: [], background: [] }

  if (federalState === 'BY') {
    const [cx, cy] = coordinatesWebMercator
    const bufferDistance = 200
    const bbox = [
      cx - bufferDistance,
      cy - bufferDistance,
      cx + bufferDistance,
      cy + bufferDistance,
    ]

    const vegetationHeightmap = await VEGETATION_DEM.getGridPoints(...bbox)

    console.log('Processing vegetation geometries...')
    const vegGeometries = await processVegetationData(
      vegetationHeightmap,
      new THREE.Vector3(0, 0, 0),
      30,
      80,
    )

    console.log('Vegetation Geometries processed successfully')
    console.log(
      `Number of surrounding geometries: ${vegGeometries.surrounding.length}`,
    )
    console.log(
      `Number of background geometries: ${vegGeometries.background.length}`,
    )

    vegetation.surrounding = vegGeometries.surrounding
    vegetation.background = vegGeometries.background

    console.log('Adding vegetation geometries to the scene...')
    vegGeometries.surrounding.forEach((geom) => {
      scene.addShadingGeometry(geom)
    })
    console.log('Vegetation processing completed')
  }

  const simulationMesh = await scene.calculate({
    solarToElectricityConversionEfficiency: 0.21 * 0.78,
    progressCallback: onProgress
      ? (progress, total) => onProgress(progress, total)
      : undefined,
  })

  const center = new THREE.Vector3()
  simulationMesh.geometry.computeBoundingBox()
  simulationMesh.geometry.boundingBox.getCenter(center)

  return {
    buildings: buildingObjects,
    simulationResult: { mesh: simulationMesh, center },
    vegetation,
    federalState,
  }
}
