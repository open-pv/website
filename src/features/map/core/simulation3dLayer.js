import {
  mainSimulation,
  preloadSimulationSceneForBounds,
} from '@/features/simulation/core/main'
import { getTileRangeForBounds } from '@/features/simulation/core/location'
import { MercatorCoordinate } from 'maplibre-gl'
import * as THREE from 'three'

const DEM_SOURCE_ID = 'openpv-dem'
export const MAP_SIMULATION_LAYER_ID = 'openpv-simulation-3d'
const PREVIEW_FADE_START_ZOOM = 15
const PREVIEW_FADE_END_ZOOM = 16
const PULSE_BASE_COLOR = new THREE.Color(0xbfc3c8)
const PULSE_PEAK_COLOR = new THREE.Color(0xffffff)
const LOCAL_ENU_TO_MAPLIBRE_MODEL = new THREE.Matrix4().makeBasis(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 1, 0),
)

function createEmptyVegetationGeometries() {
  return {
    background: [],
    surrounding: [],
  }
}

function collectObjectResources(object, geometries, materials) {
  object.traverse((child) => {
    if (!child.isMesh) {
      return
    }

    if (child.geometry) {
      geometries.add(child.geometry)
    }

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        if (material) {
          materials.add(material)
        }
      })
      return
    }

    if (child.material) {
      materials.add(child.material)
    }
  })
}

function disposeMaterial(material) {
  for (const value of Object.values(material)) {
    if (value && typeof value.dispose === 'function' && value.isTexture) {
      value.dispose()
    }
  }
  material.dispose()
}

function disposeSimulationData(data, sharedMaterials = []) {
  if (!data) {
    sharedMaterials.forEach((material) => {
      material.dispose()
    })
    return
  }

  const geometries = new Set()
  const materials = new Set(sharedMaterials)

  data.buildings.forEach((building) => {
    if (building.geometry) {
      geometries.add(building.geometry)
    }
    if (building.mesh) {
      collectObjectResources(building.mesh, geometries, materials)
    }
  })

  for (const geometry of data.vegetationGeometries.background) {
    geometries.add(geometry)
  }
  for (const geometry of data.vegetationGeometries.surrounding) {
    geometries.add(geometry)
  }

  geometries.forEach((geometry) => {
    geometry.dispose()
  })
  materials.forEach((material) => {
    disposeMaterial(material)
  })
}

function getGeometryCenter(geometry) {
  geometry.computeBoundingBox()
  return geometry.boundingBox.getCenter(new THREE.Vector3())
}

function setMaterialOpacity(material, opacity) {
  const isOpaque = opacity >= 0.999
  if (material.transparent === isOpaque) {
    material.transparent = !isOpaque
    material.needsUpdate = true
  }

  material.depthWrite = true
  material.opacity = opacity
}

function createPreviewGroup(data) {
  const group = new THREE.Group()
  const buildingMaterial = new THREE.MeshLambertMaterial({
    color: 0xc4b69f,
    side: THREE.DoubleSide,
    transparent: true,
  })
  buildingMaterial.polygonOffset = true
  buildingMaterial.polygonOffsetFactor = -1
  buildingMaterial.polygonOffsetUnits = -4
  const entries = []

  data.buildings.forEach((building) => {
    if (!building.geometry) {
      return
    }

    const mesh = new THREE.Mesh(building.geometry, buildingMaterial)
    group.add(mesh)
    entries.push({
      building,
      center: getGeometryCenter(building.geometry),
      mesh,
    })
  })

  return {
    group,
    buildingMaterial,
    entries,
    materials: [buildingMaterial],
  }
}

function createSimulationOverlayGroup(data) {
  const simulationBuilding = data.buildings.find(
    (building) => building.type === 'simulation' && building.mesh,
  )

  if (!simulationBuilding?.mesh) {
    return {
      group: null,
      materials: [],
    }
  }

  const group = new THREE.Group()
  group.add(simulationBuilding.mesh)

  const materials = new Set()
  collectObjectResources(simulationBuilding.mesh, new Set(), materials)

  const vegetationMaterial = new THREE.MeshLambertMaterial({
    color: '#3C9000',
    side: THREE.DoubleSide,
  })
  materials.add(vegetationMaterial)

  data.vegetationGeometries.background.forEach((geometry) => {
    group.add(new THREE.Mesh(geometry, vegetationMaterial))
  })
  data.vegetationGeometries.surrounding.forEach((geometry) => {
    group.add(new THREE.Mesh(geometry, vegetationMaterial))
  })

  return {
    group,
    materials: [...materials],
  }
}

function createLights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 2))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1)
  keyLight.position.set(0, -1, -2)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
  fillLight.position.set(1, 0, -2)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5)
  rimLight.position.set(-1, 0, -2)
  scene.add(rimLight)
}

function addTerrainSource(map) {
  if (!map.getSource(DEM_SOURCE_ID)) {
    map.addSource(DEM_SOURCE_ID, {
      type: 'raster-dem',
      tiles: ['https://api.openpv.de/dem/sonny/{z}/{x}/{y}.webp'],
      tileSize: 256,
      encoding: 'mapbox',
      maxzoom: 13,
      attribution:
        '&copy; <a href="https://sonny.4lima.de" target="_blank" rel="noopener noreferrer">Sonny</a> (CC-BY-4.0)',
    })
  }

  map.setTerrain({
    source: DEM_SOURCE_ID,
    exaggeration: 1,
  })
}

function getLayerInsertionPoint(map) {
  return map.getStyle()?.layers?.find((layer) => layer.type === 'symbol')?.id
}

export function createSimulation3DLayerController({
  map,
  onError,
  onLoadStateChange,
}) {
  class Simulation3DLayer {
    id = MAP_SIMULATION_LAYER_ID
    type = 'custom'
    renderingMode = '3d'

    constructor() {
      this.map = map
      this.camera = new THREE.Camera()
      this.camera.matrixAutoUpdate = false
      this.scene = new THREE.Scene()
      this.scene.matrixAutoUpdate = false
      createLights(this.scene)
      this.renderer = null
      this.preview = {
        data: null,
        entries: [],
        group: null,
        key: null,
        modelMatrix: null,
        origin: null,
        pendingKey: null,
        material: null,
        materials: [],
      }
      this.simulations = new Map()
      this.activeSimulationKey = null
      this.pulse = {
        locationKey: null,
        material: null,
        mesh: null,
        originalMaterial: null,
      }
      this.previewRequestVersion = 0
      this.simulationRequestVersion = 0
    }

    getModelMatrix(location) {
      return new THREE.Matrix4()
        .fromArray(
          this.map.transform.getMatrixForModel({
            lng: Number(location.lon),
            lat: Number(location.lat),
          }),
        )
        .multiply(LOCAL_ENU_TO_MAPLIBRE_MODEL)
    }

    onAdd(mapInstance, gl) {
      this.renderer = new THREE.WebGLRenderer({
        canvas: mapInstance.getCanvas(),
        context: gl,
        antialias: true,
      })
      this.renderer.autoClear = false
      this.renderer.toneMapping = THREE.NoToneMapping
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
    }

    onRemove() {
      this.clearScene()
      this.renderer?.dispose()
      this.renderer = null
    }

    render(_gl, options) {
      if (
        !this.renderer ||
        (!this.preview.group && this.simulations.size === 0 && !this.pulse.mesh)
      ) {
        return
      }

      const projectionMatrix = new THREE.Matrix4().fromArray(
        options.defaultProjectionData.mainMatrix,
      )
      this.camera.projectionMatrix.copy(projectionMatrix)

      const fadeOpacity = THREE.MathUtils.clamp(
        (this.map.getZoom() - PREVIEW_FADE_START_ZOOM) /
          (PREVIEW_FADE_END_ZOOM - PREVIEW_FADE_START_ZOOM),
        0,
        1,
      )

      if (this.preview.material) {
        setMaterialOpacity(this.preview.material, fadeOpacity)
      }

      const simulationEntries = [...this.simulations.values()]
      simulationEntries.forEach((simulation) => {
        simulation.materials.forEach((material) => {
          setMaterialOpacity(material, fadeOpacity)
        })
      })

      if (this.pulse.material) {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.008)
        this.pulse.material.color
          .copy(PULSE_BASE_COLOR)
          .lerp(PULSE_PEAK_COLOR, pulse)
        setMaterialOpacity(this.pulse.material, fadeOpacity)
        this.map.triggerRepaint()
      }

      this.renderer.resetState()

      if (this.preview.group && this.preview.modelMatrix) {
        simulationEntries.forEach((simulation) => {
          simulation.group.visible = false
        })

        this.camera.projectionMatrix
          .copy(projectionMatrix)
          .multiply(this.preview.modelMatrix)
        this.renderer.render(this.scene, this.camera)

        simulationEntries.forEach((simulation) => {
          simulation.group.visible = true
        })
      }

      simulationEntries.forEach((simulation) => {
        if (!simulation.group || !simulation.modelMatrix) {
          return
        }

        if (this.preview.group) {
          this.preview.group.visible = false
        }

        simulationEntries.forEach((otherSimulation) => {
          otherSimulation.group.visible = otherSimulation === simulation
        })

        this.camera.projectionMatrix
          .copy(projectionMatrix)
          .multiply(simulation.modelMatrix)
        this.renderer.resetState()
        this.renderer.render(this.scene, this.camera)
      })

      if (this.preview.group) {
        this.preview.group.visible = true
      }
      simulationEntries.forEach((simulation) => {
        simulation.group.visible = true
      })
    }

    clearScene() {
      this.clearAllSimulations()
      this.clearPreview()
      this.map.triggerRepaint()
    }

    clearPreview() {
      this.stopPulse()

      if (this.preview.group) {
        this.scene.remove(this.preview.group)
      }

      disposeSimulationData(this.preview.data, this.preview.materials)
      this.preview = {
        data: null,
        entries: [],
        group: null,
        key: null,
        modelMatrix: null,
        origin: null,
        pendingKey: null,
        material: null,
        materials: [],
      }
    }

    clearAllSimulations() {
      this.stopPulse()

      this.simulations.forEach((simulation) => {
        simulation.hiddenPreviewMeshes.forEach((mesh) => {
          mesh.visible = true
        })
        if (simulation.group) {
          this.scene.remove(simulation.group)
        }
        disposeSimulationData(simulation.data, simulation.materials)
      })

      this.simulations.clear()
      this.activeSimulationKey = null
    }

    clearActiveSimulationSelection() {
      this.simulationRequestVersion += 1
      this.activeSimulationKey = null
      this.stopPulse()
    }

    syncPreviewVisibilityForSimulations() {
      this.simulations.forEach((simulation) => {
        simulation.hiddenPreviewMeshes.forEach((mesh) => {
          mesh.visible = true
        })
        simulation.hiddenPreviewMeshes = []

        const entry = this.findClosestPreviewEntry(simulation.location)
        if (entry) {
          entry.mesh.visible = false
          simulation.hiddenPreviewMeshes = [entry.mesh]
        }
      })
    }

    findClosestPreviewEntry(location) {
      if (
        this.preview.entries.length === 0 ||
        !this.preview.group ||
        !this.preview.origin
      ) {
        return null
      }

      const target = MercatorCoordinate.fromLngLat({
        lng: Number(location.lon),
        lat: Number(location.lat),
      })

      let closestEntry = null
      let minDistance = Infinity
      const previewOrigin = MercatorCoordinate.fromLngLat({
        lng: Number(this.preview.origin.lon),
        lat: Number(this.preview.origin.lat),
      })
      const previewScale = previewOrigin.meterInMercatorCoordinateUnits()
      const targetLocal = new THREE.Vector3(
        (target.x - previewOrigin.x) / previewScale,
        -(target.y - previewOrigin.y) / previewScale,
        (target.z - previewOrigin.z) / previewScale,
      )

      for (const entry of this.preview.entries) {
        const distance =
          (entry.center.x - targetLocal.x) * (entry.center.x - targetLocal.x) +
          (entry.center.y - targetLocal.y) * (entry.center.y - targetLocal.y)

        if (distance < minDistance) {
          minDistance = distance
          closestEntry = entry
        }
      }

      return closestEntry
    }

    startPulse(location) {
      this.stopPulse()

      const entry = this.findClosestPreviewEntry(location)
      if (!entry) {
        return null
      }

      const pulseMaterial = entry.mesh.material.clone()
      entry.mesh.material = pulseMaterial
      this.pulse = {
        locationKey: `${location.lon}:${location.lat}`,
        material: pulseMaterial,
        mesh: entry.mesh,
        originalMaterial: this.preview.material,
      }
      this.map.triggerRepaint()

      return entry
    }

    stopPulse() {
      if (
        !this.pulse.mesh ||
        !this.pulse.material ||
        !this.pulse.originalMaterial
      ) {
        this.pulse = {
          locationKey: null,
          material: null,
          mesh: null,
          originalMaterial: null,
        }
        return
      }

      this.pulse.mesh.material = this.pulse.originalMaterial
      this.pulse.material.dispose()
      this.pulse = {
        locationKey: null,
        material: null,
        mesh: null,
        originalMaterial: null,
      }
    }

    renderPreviewData(result, location, key) {
      this.clearPreview()

      this.preview.data = {
        buildings: result.buildings,
        vegetationGeometries:
          result.vegetationGeometries || createEmptyVegetationGeometries(),
      }

      const { buildingMaterial, entries, group, materials } =
        createPreviewGroup(this.preview.data)
      this.preview.entries = entries
      this.preview.group = group
      this.preview.key = key
      this.preview.modelMatrix = this.getModelMatrix(location)
      this.preview.origin = location
      this.preview.material = buildingMaterial
      this.preview.materials = materials
      this.scene.add(group)
      this.syncPreviewVisibilityForSimulations()
      this.map.triggerRepaint()
    }

    renderSimulationOverlay(result, location, key) {
      if (this.simulations.has(key)) {
        this.stopPulse()
        return
      }

      const { group, materials } = createSimulationOverlayGroup(result)
      if (!group) {
        this.stopPulse()
        return
      }

      const hiddenPreviewMeshes = []
      const pulseMesh = this.pulse.mesh
      this.stopPulse()
      if (pulseMesh) {
        pulseMesh.visible = false
        hiddenPreviewMeshes.push(pulseMesh)
      } else {
        const entry = this.findClosestPreviewEntry(location)
        if (entry) {
          entry.mesh.visible = false
          hiddenPreviewMeshes.push(entry.mesh)
        }
      }

      const simulation = {
        data: result,
        group,
        hiddenPreviewMeshes,
        key,
        location,
        modelMatrix: this.getModelMatrix(location),
        materials,
      }
      this.simulations.set(key, simulation)
      this.scene.add(group)
      this.map.triggerRepaint()
    }

    async preloadBounds(region) {
      const normalizedRegion =
        region?.bounds && region?.center
          ? {
              bounds: region.bounds.map(Number),
              center: {
                lat: Number(region.center.lat),
                lon: Number(region.center.lon),
              },
            }
          : null

      if (!normalizedRegion) {
        this.previewRequestVersion += 1
        this.clearScene()
        return
      }

      addTerrainSource(this.map)

      const tileRange = getTileRangeForBounds(normalizedRegion.bounds)
      const previewKey = [
        tileRange.xMin,
        tileRange.xMax,
        tileRange.yMin,
        tileRange.yMax,
      ].join(':')

      if (
        previewKey === this.preview.key ||
        previewKey === this.preview.pendingKey
      ) {
        return
      }

      const requestVersion = ++this.previewRequestVersion
      this.preview.pendingKey = previewKey
      onLoadStateChange?.(true)

      try {
        const result = await preloadSimulationSceneForBounds(normalizedRegion)
        if (requestVersion !== this.previewRequestVersion) {
          disposeSimulationData(result)
          return
        }

        if (result.status === 'ErrorAdress') {
          this.clearScene()
          return
        }

        this.renderPreviewData(result, normalizedRegion.center, previewKey)
      } catch (error) {
        if (requestVersion !== this.previewRequestVersion) {
          return
        }

        this.clearPreview()
        onError?.(error)
      } finally {
        if (requestVersion === this.previewRequestVersion) {
          this.preview.pendingKey = null
          onLoadStateChange?.(false)
        }
      }
    }

    async setLocation(location) {
      const normalizedLocation = location
        ? {
            lat: Number(location.lat),
            lon: Number(location.lon),
          }
        : null

      if (!normalizedLocation) {
        this.clearActiveSimulationSelection()
        return
      }

      addTerrainSource(this.map)

      const locationKey = `${normalizedLocation.lon}:${normalizedLocation.lat}`
      if (this.simulations.has(locationKey)) {
        this.clearActiveSimulationSelection()
        return
      }

      this.clearActiveSimulationSelection()
      this.activeSimulationKey = locationKey
      this.startPulse(normalizedLocation)

      const requestVersion = ++this.simulationRequestVersion
      onLoadStateChange?.(true)

      try {
        const result = await mainSimulation(normalizedLocation)
        if (requestVersion !== this.simulationRequestVersion) {
          disposeSimulationData(result)
          return
        }

        if (result.status !== 'Results') {
          this.stopPulse()
          return
        }

        this.renderSimulationOverlay(result, normalizedLocation, locationKey)
      } catch (error) {
        if (requestVersion !== this.simulationRequestVersion) {
          return
        }

        this.stopPulse()
        onError?.(error)
      } finally {
        if (requestVersion === this.simulationRequestVersion) {
          this.activeSimulationKey = null
          onLoadStateChange?.(false)
        }
      }
    }
  }

  const layer = new Simulation3DLayer()

  const ensureMounted = () => {
    addTerrainSource(map)

    if (!map.getLayer(layer.id)) {
      map.addLayer(layer, getLayerInsertionPoint(map))
    }
  }

  const handleStyleLoad = () => {
    ensureMounted()
    if (
      layer.preview.group &&
      !layer.scene.children.includes(layer.preview.group)
    ) {
      layer.scene.add(layer.preview.group)
    }
    layer.simulations.forEach((simulation) => {
      if (
        simulation.group &&
        !layer.scene.children.includes(simulation.group)
      ) {
        layer.scene.add(simulation.group)
      }
    })
    map.triggerRepaint()
  }

  ensureMounted()
  map.on('style.load', handleStyleLoad)

  return {
    preloadBounds: (region) => layer.preloadBounds(region),
    setLocation: (location) => layer.setLocation(location),
    clear: () => layer.setLocation(null),
    remove: () => {
      map.off('style.load', handleStyleLoad)
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id)
      } else {
        layer.onRemove()
      }
      if (map.getTerrain()) {
        map.setTerrain(null)
      }
      if (map.getSource(DEM_SOURCE_ID)) {
        map.removeSource(DEM_SOURCE_ID)
      }
    },
  }
}
