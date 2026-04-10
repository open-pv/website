import { mainSimulation } from '@/features/simulation/core/main'
import { MercatorCoordinate } from 'maplibre-gl'
import * as THREE from 'three'

const DEM_SOURCE_ID = 'openpv-dem'
export const MAP_SIMULATION_LAYER_ID = 'openpv-simulation-3d'

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

function createSceneGroup(data) {
  const group = new THREE.Group()
  const buildingMaterial = new THREE.MeshLambertMaterial({
    color: 0xc4b69f,
    side: THREE.DoubleSide,
  })
  const vegetationMaterial = new THREE.MeshLambertMaterial({
    color: '#3C9000',
    side: THREE.DoubleSide,
  })

  data.buildings.forEach((building) => {
    if (building.type === 'simulation' && building.mesh) {
      group.add(building.mesh)
      return
    }

    if (!building.geometry) {
      return
    }

    group.add(new THREE.Mesh(building.geometry, buildingMaterial))
  })

  data.vegetationGeometries.background.forEach((geometry) => {
    group.add(new THREE.Mesh(geometry, vegetationMaterial))
  })
  data.vegetationGeometries.surrounding.forEach((geometry) => {
    group.add(new THREE.Mesh(geometry, vegetationMaterial))
  })

  return {
    group,
    materials: [buildingMaterial, vegetationMaterial],
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
      this.root = null
      this.renderer = null
      this.modelMatrix = null
      this.data = null
      this.sharedMaterials = []
      this.requestVersion = 0
      this.activeLocationKey = null
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
      if (!this.renderer || !this.modelMatrix || !this.root) {
        return
      }

      const projectionMatrix = new THREE.Matrix4().fromArray(
        options.defaultProjectionData.mainMatrix,
      )
      this.camera.projectionMatrix
        .copy(projectionMatrix)
        .multiply(this.modelMatrix)

      this.renderer.resetState()
      this.renderer.render(this.scene, this.camera)
    }

    clearScene() {
      if (this.root) {
        this.scene.remove(this.root)
        this.root = null
      }

      disposeSimulationData(this.data, this.sharedMaterials)
      this.data = null
      this.sharedMaterials = []
      this.modelMatrix = null
      this.activeLocationKey = null
      this.map.triggerRepaint()
    }

    updateModelTransform(location) {
      const modelOrigin = MercatorCoordinate.fromLngLat({
        lng: Number(location.lon),
        lat: Number(location.lat),
      })
      const modelScale = modelOrigin.meterInMercatorCoordinateUnits()

      this.modelMatrix = new THREE.Matrix4()
        .makeTranslation(modelOrigin.x, modelOrigin.y, modelOrigin.z)
        .scale(new THREE.Vector3(modelScale, -modelScale, modelScale))
    }

    async setLocation(location) {
      const normalizedLocation = location
        ? {
            lat: Number(location.lat),
            lon: Number(location.lon),
          }
        : null

      if (!normalizedLocation) {
        this.requestVersion += 1
        this.clearScene()
        this.map.setTerrain(null)
        return
      }

      addTerrainSource(this.map)

      const locationKey = `${normalizedLocation.lon}:${normalizedLocation.lat}`
      if (locationKey === this.activeLocationKey) {
        return
      }

      const requestVersion = ++this.requestVersion
      this.activeLocationKey = locationKey
      onLoadStateChange?.(true)

      try {
        const result = await mainSimulation(normalizedLocation)
        if (requestVersion !== this.requestVersion) {
          disposeSimulationData(result)
          return
        }

        if (result.status !== 'Results') {
          this.clearScene()
          this.map.setTerrain(null)
          return
        }

        this.clearScene()
        this.data = {
          buildings: result.buildings,
          vegetationGeometries:
            result.vegetationGeometries || createEmptyVegetationGeometries(),
        }

        const { group, materials } = createSceneGroup(this.data)
        this.root = group
        this.sharedMaterials = materials
        this.scene.add(group)
        this.updateModelTransform(normalizedLocation)
        this.activeLocationKey = locationKey
        this.map.triggerRepaint()
      } catch (error) {
        if (requestVersion !== this.requestVersion) {
          return
        }

        this.clearScene()
        this.activeLocationKey = null
        this.map.setTerrain(null)
        onError?.(error)
      } finally {
        if (requestVersion === this.requestVersion) {
          onLoadStateChange?.(false)
        }
      }
    }
  }

  const layer = new Simulation3DLayer()

  const ensureMounted = () => {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer, getLayerInsertionPoint(map))
    }
  }

  const handleStyleLoad = () => {
    ensureMounted()
    if (layer.data && layer.root) {
      addTerrainSource(map)
      layer.scene.add(layer.root)
      map.triggerRepaint()
    }
  }

  ensureMounted()
  map.on('style.load', handleStyleLoad)

  return {
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
