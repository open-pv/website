import { ShadingScene, colormaps } from '@openpv/simshady'
import * as THREE from 'three'
import { c0, c1, c2 } from '@/constants/colors'
import {
  createSkydomeURL,
  downloadBuildings,
  downloadBuildingsInBounds,
  getFederalState,
} from '@/features/simulation/core/download'
import { VEGETATION_DEM } from '@/features/simulation/core/elevation'
import { coordinatesWebMercator } from '@/features/simulation/core/location'
import { processGeometries } from '@/features/simulation/core/preprocessing'
import { processVegetationData } from '@/features/simulation/core/processVegetationTiffs'

function resolveCallback(callback, globalName) {
  if (callback) {
    return callback
  }

  if (
    typeof window !== 'undefined' &&
    typeof window[globalName] === 'function'
  ) {
    return window[globalName]
  }

  return null
}

function emptyVegetationGeometries() {
  return {
    background: [],
    surrounding: [],
  }
}

function createSimulationResult() {
  return {
    buildings: [],
    federalState: false,
    status: 'Loading',
    vegetationGeometries: emptyVegetationGeometries(),
  }
}

function resolveCallbacks(callbacks = {}) {
  return {
    setBuildings: resolveCallback(callbacks.setBuildings, 'setBuildings'),
    setFederalState: resolveCallback(
      callbacks.setFederalState,
      'setFederalState',
    ),
    setFrontendState: resolveCallback(
      callbacks.setFrontendState,
      'setFrontendState',
    ),
    setSimulationProgress: resolveCallback(
      callbacks.setSimulationProgress,
      'setSimulationProgress',
    ),
    setVegetationGeometries: resolveCallback(
      callbacks.setVegetationGeometries,
      'setVegetationGeometries',
    ),
  }
}

async function loadBaseSceneData(location, callbacks = {}) {
  const {
    setBuildings,
    setFederalState,
    setFrontendState,
    setVegetationGeometries,
  } = callbacks
  const result = createSimulationResult()

  // Clear previous attributions if any
  if (typeof window !== 'undefined' && window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location === 'undefined' || location === null) {
    return { result, simulationBuildings: [] }
  }

  const buildingObjects = await downloadBuildings(location)
  result.buildings = buildingObjects
  processGeometries(buildingObjects, new THREE.Vector3(0, 0, 0), 80)

  const simulationBuildings = buildingObjects.filter(
    (b) => b.type === 'simulation',
  )
  if (simulationBuildings.length === 0) {
    result.status = 'ErrorAdress'
    setFrontendState?.('ErrorAdress')
    return { result, simulationBuildings }
  }

  setBuildings?.(buildingObjects)

  result.federalState = getFederalState()
  setFederalState?.(result.federalState)
  setVegetationGeometries?.(result.vegetationGeometries)

  if (getFederalState() === 'BY') {
    const [cx, cy] = coordinatesWebMercator
    const bufferDistance = 200
    const bbox = [
      cx - bufferDistance,
      cy - bufferDistance,
      cx + bufferDistance,
      cy + bufferDistance,
    ]

    const vegetationHeightmap = await VEGETATION_DEM.getGridPoints(...bbox)
    const vegetationGeometries = await processVegetationData(
      vegetationHeightmap,
      new THREE.Vector3(0, 0, 0),
      30,
      80,
    )

    result.vegetationGeometries = vegetationGeometries
    setVegetationGeometries?.(vegetationGeometries)
  }

  result.status = 'Preview'

  return { result, simulationBuildings }
}

export async function preloadSimulationScene(location, callbacks = {}) {
  const resolvedCallbacks = resolveCallbacks(callbacks)
  const { result } = await loadBaseSceneData(location, resolvedCallbacks)
  return result
}

export async function preloadSimulationSceneForBounds(region, callbacks = {}) {
  const { setBuildings, setFederalState, setVegetationGeometries } =
    resolveCallbacks(callbacks)
  const result = createSimulationResult()

  if (!region?.bounds || !region?.center) {
    return result
  }

  const buildingObjects = await downloadBuildingsInBounds(
    region.bounds,
    region.center,
  )
  result.buildings = buildingObjects
  result.federalState = getFederalState()
  result.status = 'Preview'

  setBuildings?.(buildingObjects)
  setFederalState?.(result.federalState)
  setVegetationGeometries?.(result.vegetationGeometries)

  return result
}

export async function mainSimulation(location, callbacks = {}) {
  const resolvedCallbacks = resolveCallbacks(callbacks)
  const { setBuildings, setFrontendState, setSimulationProgress } =
    resolvedCallbacks
  const { result, simulationBuildings } = await loadBaseSceneData(
    location,
    resolvedCallbacks,
  )

  if (result.status !== 'Preview') {
    return result
  }

  const scene = new ShadingScene()
  result.buildings
    .filter((b) => b.type === 'simulation')
    .forEach((b) => {
      scene.addSimulationGeometry(b.geometry)
    })

  result.buildings
    .filter((b) => b.type === 'surrounding')
    .forEach((b) => {
      scene.addShadingGeometry(b.geometry)
    })

  scene.addColorMap(
    colormaps.interpolateThreeColors({ c0: c0, c1: c1, c2: c2 }),
  )

  const irradianceUrl = createSkydomeURL(location.lat, location.lon)
  await scene.addSolarIrradianceFromURL(irradianceUrl)

  result.vegetationGeometries.surrounding.forEach((geom) => {
    scene.addShadingGeometry(geom)
  })

  function loadingBarWrapperFunction(progress, total) {
    return setSimulationProgress?.((progress * 100) / total)
  }

  const simulationMesh = await scene.calculate({
    solarToElectricityConversionEfficiency: 0.21 * 0.78,
    progressCallback: loadingBarWrapperFunction,
  })

  simulationBuildings.forEach((b) => {
    b.mesh = simulationMesh.clone()
  })

  const middle = new THREE.Vector3()
  simulationMesh.geometry.computeBoundingBox()
  simulationMesh.geometry.boundingBox.getCenter(middle)
  simulationBuildings[0].simulationMiddle = middle

  result.status = 'Results'

  setBuildings?.([...result.buildings])
  setFrontendState?.('Results')

  return result
}
