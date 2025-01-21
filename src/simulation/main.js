import { ShadingScene, colormaps } from '@openpv/simshady'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  downloadBuildings,
  downloadVegetationHeightmap,
  getFederalState,
} from './download'
import { coordinatesWebMercator } from './location'
import { processGeometries } from './preprocessing'

import {
  processVegetationData,
  processVegetationHeightmapData,
} from './processVegetationTiffs'

const c0 = [0, 0, 0.2]
const c1 = [1, 0.2, 0.1]
const c2 = [1, 1, 0.1]

export async function mainSimulation(location) {
  // Clear previous attributions if any
  if (window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location !== 'undefined' && location != null) {
    const buildingGeometries = await downloadBuildings(location)
    //const vegetationData = await retrieveVegetationRasters(location)

    let geometries = processGeometries(
      buildingGeometries,
      new THREE.Vector3(0, 0, 0),
      80,
    )

    window.setGeometries(geometries)
    if (geometries.simulation.length == 0) {
      window.setFrontendState('ErrorAdress')
      return { simulationMesh: undefined }
    }

    const scene = new ShadingScene(
      parseFloat(location.lat),
      parseFloat(location.lon),
    )
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

    if (getFederalState() == 'BY') {
      const [cx, cy] = coordinatesWebMercator
      console.log('coordinatesWebMercator:' + coordinatesWebMercator)
      const bufferDistance = 200 // 1km buffer, adjust as needed
      const bbox = [
        cx - bufferDistance,
        cy - bufferDistance,
        cx + bufferDistance,
        cy + bufferDistance,
      ]

      console.log('Starting vegetation processing...')
      console.log(`Bounding box for vegetation data: [${bbox.join(', ')}]`)

      try {
        console.log('Downloading vegetation heightmap data...')
        const vegetationHeightmapData = await downloadVegetationHeightmap(bbox)

        if (!vegetationHeightmapData) {
          throw new Error('Failed to download vegetation heightmap data')
        }

        console.log('Vegetation Heightmap Data downloaded successfully')
        console.log(
          `Data dimensions: ${vegetationHeightmapData.width}x${vegetationHeightmapData.height}`,
        )
        console.log(
          `Data bounding box: [${vegetationHeightmapData.bbox.join(', ')}]`,
        )

        console.log('Processing vegetation raster data...')
        const vegetationRaster = processVegetationHeightmapData(
          vegetationHeightmapData,
        )

        if (!vegetationRaster) {
          throw new Error('Failed to process vegetation raster data')
        }

        console.log('Vegetation Raster processed successfully')

        console.log('Processing vegetation geometries...')
        const vegetationGeometries = await processVegetationData(
          vegetationRaster,
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
      } catch (error) {
        console.error('Error in vegetation processing:', error)
        console.error('Error stack:', error.stack)
        // You might want to set an error state or display an error message to the user here
      }

      console.log('Vegetation processing completed')
    }

    let numSimulations = window.numSimulations || 80
    function loadingBarWrapperFunction(progress, total) {
      return window.setSimulationProgress((progress * 100) / total)
    }

    const simulationMesh = await scene.calculate({
      numberSimulations: numSimulations,
      pvCellEfficiency: 0.138,
      maxYieldPerSquareMeter: 1400 * 0.138,
      diffuseIrradianceURL: 'https://www.openpv.de/data/irradiance/',
      urlDirectIrrandianceTIF:
        'https://www.openpv.de/data/irradiance/geotiff/average_direct_radiation.tif',
      urlDiffuseIrrandianceTIF:
        'https://www.openpv.de/data/irradiance/geotiff/average_diffuse_radiation.tif',
      progressCallback: loadingBarWrapperFunction,
    })

    let middle = new THREE.Vector3()
    simulationMesh.geometry.computeBoundingBox()
    simulationMesh.geometry.boundingBox.getCenter(middle)
    simulationMesh.middle = middle

    return { simulationMesh }
  }
}

export async function simulationForNewBuilding(props) {
  // Get all geometries from the list and put it in one big simulation geometries. This needs
  // to be done since multiple buildings can be part of selectedMesh
  let newSimulationGeometries = mergeGeometries(
    props.selectedMesh.map((mesh) => mesh.geometry),
  )

  newSimulationGeometries.computeBoundingBox()
  newSimulationGeometries.computeBoundingSphere()
  let simulationCenter = new THREE.Vector3()
  newSimulationGeometries.boundingBox.getCenter(simulationCenter)
  console.log(props.geometries)
  const radius = newSimulationGeometries.boundingSphere.radius + 80
  const allBuildingGeometries = [
    ...props.geometries.surrounding,
    ...props.geometries.background,
    ...props.geometries.simulation,
  ]
  const geometries = processGeometries(
    allBuildingGeometries,
    simulationCenter,
    radius,
  )
  const shadingScene = new ShadingScene(
    parseFloat(props.geoLocation.lat),
    parseFloat(props.geoLocation.lon),
  )
  shadingScene.addColorMap(
    colormaps.interpolateThreeColors({ c0: c0, c1: c1, c2: c2 }),
  )

  shadingScene.addSimulationGeometry(newSimulationGeometries)
  geometries.surrounding.forEach((geom) => {
    shadingScene.addShadingGeometry(geom)
  })

  let numSimulations = window.numSimulations || 80

  let simulationMesh = await shadingScene.calculate({
    numberSimulations: numSimulations,
    pvCellEfficiency: 0.138,
    maxYieldPerSquareMeter: 1400 * 0.138,
    diffuseIrradianceURL: 'https://www.openpv.de/data/irradiance/',
    urlDirectIrrandianceTIF:
      'https://www.openpv.de/data/irradiance/geotiff/average_direct_radiation.tif',
    urlDiffuseIrrandianceTIF:
      'https://www.openpv.de/data/irradiance/geotiff/average_diffuse_radiation.tif',
    progressCallback: (progress, total) =>
      console.log(`Simulation Progress: ${progress} of ${total}`),
  })
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  })
  simulationMesh.material = material
  simulationMesh.name = 'simulationMesh'

  props.setSimulationMeshes([...props.simulationMeshes, simulationMesh])
  /// Delete the new simualted building from the background / surrounding geometries list
  const selectedMeshNames = props.selectedMesh.map((mesh) => mesh.geometry.name)

  const updatedSurroundings = props.geometries.surrounding.filter(
    (mesh) => !selectedMeshNames.includes(mesh.name),
  )
  const updatedBackground = props.geometries.background.filter(
    (mesh) => !selectedMeshNames.includes(mesh.name),
  )

  window.setGeometries({
    surrounding: updatedSurroundings,
    background: updatedBackground,
    simulation: props.geometries.simulation, // right now this is not updated
    // The information on simulation geometries is stored in the simulationMeshes
    // React state
  })

  props.setSelectedMesh([])
}
