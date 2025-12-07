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
    // 1️⃣ Download raw building objects (each has {id, type, geometry})
    const buildingObjects = await downloadBuildings(location)

    // 2️⃣ Tag each building with its correct type (simulation, surrounding, background)
    //    The function mutates the objects in‑place and also returns the same array.
    processGeometries(buildingObjects, new THREE.Vector3(0, 0, 0), 80)

    // 3️⃣ Group geometries by the newly assigned type.
    // This is a temporary change.
    const geometries = {
      simulation: buildingObjects
        .filter((b) => b.type === 'simulation')
        .map((b) => b.geometry),
      surrounding: buildingObjects
        .filter((b) => b.type === 'surrounding')
        .map((b) => b.geometry),
      background: buildingObjects
        .filter((b) => b.type === 'background')
        .map((b) => b.geometry),
    }

    // 4️⃣ Expose the grouped geometries to the UI (unchanged API)
    window.setGeometries(geometries)
    if (geometries.simulation.length == 0) {
      window.setFrontendState('ErrorAdress')
      return { simulationMesh: undefined }
    }

    const scene = new ShadingScene()
    geometries.simulation.forEach((geom) => {
      scene.addSimulationGeometry(geom)
      scene.addShadingGeometry(geom)
    })
    geometries.surrounding.forEach((geom) => {
      scene.addShadingGeometry(geom)
    })

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

    let middle = new THREE.Vector3()
    simulationMesh.geometry.computeBoundingBox()
    simulationMesh.geometry.boundingBox.getCenter(middle)
    simulationMesh.middle = middle

    return { simulationMesh }
  }
}
