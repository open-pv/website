import { ShadingScene, colormaps } from '@openpv/simshady'
import * as THREE from 'three'
import { c0, c1, c2 } from '../data/constants'
import {
  createSkydomeURL,
  downloadBuildings,
  getFederalState,
} from './download'
import { VEGETATION_DEM } from './elevation'
import { coordinatesWebMercator } from './location'
import { processGeometries } from './preprocessing'
import { processVegetationData } from './processVegetationTiffs'

export async function mainSimulation(location) {
  // Clear previous attributions if any
  if (window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location !== 'undefined' && location != null) {
    // Download raw building objects (each has {id, type, geometry})
    const buildingObjects = await downloadBuildings(location)
    processGeometries(buildingObjects, new THREE.Vector3(0, 0, 0), 80)
    if (window.setBuildings) {
      window.setBuildings(buildingObjects)
    }

    const simulationBuildings = buildingObjects.filter(
      (b) => b.type === 'simulation',
    )

    if (simulationBuildings.length == 0) {
      window.setFrontendState('ErrorAdress')
      return {}
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

    if (getFederalState() == 'BY') {
      const [cx, cy] = coordinatesWebMercator
      const bufferDistance = 200 // 1km buffer, adjust as needed
      const bbox = [
        cx - bufferDistance,
        cy - bufferDistance,
        cx + bufferDistance,
        cy + bufferDistance,
      ]

      const vegetationHeightmap = await VEGETATION_DEM.getGridPoints(...bbox)

      console.log('Processing vegetation geometries...')
      const vegetationGeometries = await processVegetationData(
        vegetationHeightmap,
        new THREE.Vector3(0, 0, 0),
        30,
        80,
      )

      console.log('Vegetation Geometries processed successfully')
      console.log(
        `Number of surrounding geometries: ${vegetationGeometries.surrounding.length}`,
      )
      console.log(
        `Number of background geometries: ${vegetationGeometries.background.length}`,
      )

      window.setVegetationGeometries(vegetationGeometries)

      console.log('Adding vegetation geometries to the scene...')
      vegetationGeometries.surrounding.forEach((geom) => {
        scene.addShadingGeometry(geom)
      })
      console.log('Vegetation geometries added to the scene')

      console.log('Vegetation processing completed')
    }

    function loadingBarWrapperFunction(progress, total) {
      return window.setSimulationProgress((progress * 100) / total)
    }

    const simulationMesh = await scene.calculate({
      // .21 is the efficiency of a solar panel
      // .78 is the coverage factor of panels on a roof

      solarToElectricityConversionEfficiency: 0.21 * 0.78,

      progressCallback: loadingBarWrapperFunction,
    })

    // Attach the resulting simulation mesh to each simulation building.
    simulationBuildings.forEach((b) => {
      b.mesh = simulationMesh.clone()
    })

    // Store the centre point of the mesh on the first simulation building for camera positioning.
    if (simulationBuildings.length > 0) {
      const middle = new THREE.Vector3()
      simulationMesh.geometry.computeBoundingBox()
      simulationMesh.geometry.boundingBox.getCenter(middle)
      simulationBuildings[0].simulationMiddle = middle
    }
    return {}
  }
}
