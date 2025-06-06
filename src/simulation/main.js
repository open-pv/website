import { ShadingScene, colormaps } from '@openpv/simshady'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
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
  const shadingScene = new ShadingScene()

  shadingScene.addColorMap(
    colormaps.interpolateThreeColors({ c0: c0, c1: c1, c2: c2 }),
  )

  const irradianceUrl = createSkydomeURL(
    parseFloat(props.geoLocation.lat),
    parseFloat(props.geoLocation.lon),
  )
  await shadingScene.addSolarIrradianceFromURL(irradianceUrl)

  shadingScene.addSimulationGeometry(newSimulationGeometries)
  geometries.surrounding.forEach((geom) => {
    shadingScene.addShadingGeometry(geom)
  })

  let simulationMesh = await shadingScene.calculate({
    solarToElectricityConversionEfficiency: 0.21 * 0.78,
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
