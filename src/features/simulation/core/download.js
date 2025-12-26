import * as THREE from 'three'
import { Matrix4 } from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { attributions } from '@/constants/licenses'
import {
  coordinatesLonLat,
  projectToWebMercator,
} from '@/features/simulation/core/location'

let federalState = null

export function getFederalState() {
  return federalState
}

export function tile2meters() {
  return 1222.992452 * mercator2meters()
}

export function mercator2meters() {
  const lat = coordinatesLonLat[1]
  return Math.cos((lat * Math.PI) / 180.0)
}

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.preload()
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let _globalBuildingId = 0

function getFileNames(lon, lat) {
  let [x, y] = projectToWebMercator(lon, lat)

  const x0 = Math.round(x) - 1
  const x1 = Math.round(x)
  const y0 = Math.round(y) - 1
  const y1 = Math.round(y)

  let downloads = [
    { tile: { x: x0, y: y0 }, center: { x, y } },
    { tile: { x: x1, y: y0 }, center: { x, y } },
    { tile: { x: x0, y: y1 }, center: { x, y } },
    { tile: { x: x1, y: y1 }, center: { x, y } },
  ]
  return downloads
}

/**
 * Download building data for a given location.
 * Returns an array of building objects:
 *   { id: Number, type: 'background', geometry: THREE.BufferGeometry }
 */
export async function downloadBuildings(loc) {
  const filenames = getFileNames(Number(loc.lon), Number(loc.lat))
  const promises = filenames.map((filename) => downloadBuildingTile(filename))
  const results = await Promise.all(promises)

  // `results` is an array of arrays (one per tile). Flatten it and return.
  return results.flat()
}

/**
 * Download a single tile, convert the GLB into a list of building objects.
 * Each building gets a unique `id` and a default `type` of "background".
 */
async function downloadBuildingTile(download_spec) {
  const { tile, center } = download_spec
  const url = `https://maps.heidler.info/germany-draco/15-${tile.x}-${tile.y}.glb`

  try {
    const data = await gltfLoader.loadAsync(url)
    let buildingObjects = []

    for (let scene of data.scenes) {
      for (let child of scene.children) {
        let geometry = child.geometry

        const scale2tile = new Matrix4()
        scale2tile.makeScale(1 / 8192, 1 / 8192, 1.0)
        const translate = new Matrix4()
        translate.makeTranslation(tile.x - center.x, tile.y - center.y, 0.0)
        const scale2meters = new Matrix4()
        // Flip sign of Y axis (in WebMercator, Y+ points down, but we need it to point up)
        scale2meters.makeScale(tile2meters(), -tile2meters(), 1.0)

        const tx = scale2meters
        tx.multiply(translate)
        tx.multiply(scale2tile)
        geometry.applyMatrix4(tx)

        // Essentially all of our code assumes that the geometries are not indexed
        // This makes sure of that
        geometry = geometry.toNonIndexed()

        let buildings = {}
        const position = geometry.attributes.position.array
        const normal = geometry.attributes.normal.array
        const feature_ids = geometry.attributes._feature_id_0.array

        for (let i = 0; i < geometry.attributes.position.count; i++) {
          const key = feature_ids[i]
          if (!buildings.hasOwnProperty(key)) {
            buildings[key] = {
              position: [],
              normal: [],
            }
          }
          for (let j = 0; j < 3; j++) {
            buildings[key].position.push(position[3 * i + j])
            buildings[key].normal.push(normal[3 * i + j])
          }
        }

        // Convert each grouped building into a BufferGeometry and wrap it
        for (let { position, normal } of Object.values(buildings)) {
          const buildingGeometry = new THREE.BufferGeometry()
          const posAttr = new THREE.BufferAttribute(
            new Float32Array(position),
            3,
          )
          const normAttr = new THREE.BufferAttribute(
            new Float32Array(normal),
            3,
          )
          buildingGeometry.setAttribute('position', posAttr)
          buildingGeometry.setAttribute('normal', normAttr)

          buildingObjects.push({
            id: ++_globalBuildingId,
            type: 'background', // default type; will be updated later by preprocessing
            geometry: buildingGeometry,
          })
        }
      }
    }

    // Parse Bundesländer (federal state) information
    const buffer = await data.parser.getDependency('bufferView', 0)
    const ids = new TextDecoder().decode(buffer)
    for (const bundesland of Object.keys(attributions)) {
      if (ids.includes(`DE${bundesland}`)) {
        window.setFederalState(bundesland)
        federalState = bundesland
      }
    }

    return buildingObjects
  } catch (error) {
    console.warn(error)
    return []
  }
}

export const createSkydomeURL = (lat, lon) => {
  function roundToNearest(value, multiple) {
    return Math.round(value / multiple) * multiple
  }
  const roundedLat = roundToNearest(lat, 0.2)
  const roundedLon = roundToNearest(lon, 0.2)

  // Format to one decimal place to avoid floating-point inaccuracies
  const formattedLat = roundedLat.toFixed(1)
  const formattedLon = roundedLon.toFixed(1)

  // Create the dynamic URL with the properly formatted values
  return `https://api.openpv.de/skymaps/irradiance_${formattedLat}_${formattedLon}_2018_yearly.json`
}
