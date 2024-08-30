import * as GeoTIFF from "geotiff"
import proj4 from "proj4"

import * as pako from "pako"
import * as THREE from "three"
import { Matrix4 } from "three"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { attributions } from "../data/dataLicense"
import { coordinatesLonLat, projectToWebMercator } from "./location"

export function tile2meters() {
  return 1222.992452 * mercator2meters()
}

export function mercator2meters() {
  const lat = coordinatesLonLat[1]
  return Math.cos((lat * Math.PI) / 180.0)
}

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")
dracoLoader.preload()
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

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

export async function downloadBuildings(loc) {
  const filenames = getFileNames(Number(loc.lon), Number(loc.lat))
  const promises = filenames.map((filename) => downloadFile(filename))
  const geometries = await Promise.all(promises)
  return geometries.flat()
}

async function downloadFile(download_spec) {
  const { tile, center } = download_spec
  const url = `https://maps.heidler.info/germany-draco/15-${tile.x}-${tile.y}.glb`

  try {
    const data = await gltfLoader.loadAsync(url)
    let geometries = []
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
        // i.e. that position[9*i...(9*i)+9] always refers to a single triangle
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
        for (let { position, normal } of Object.values(buildings)) {
          let buildingGeometry = new THREE.BufferGeometry()
          position = new THREE.BufferAttribute(new Float32Array(position), 3)
          buildingGeometry.setAttribute("position", position)
          normal = new THREE.BufferAttribute(new Float32Array(normal), 3)
          buildingGeometry.setAttribute("normal", normal)
          geometries.push(buildingGeometry)
        }
      }
    }

    // Parse Bundesländer
    const buffer = await data.parser.getDependency("bufferView", 0)
    const ids = new TextDecoder().decode(buffer)
    for (const bundesland of Object.keys(attributions)) {
      if (ids.includes(`DE${bundesland}`)) {
        window.setFederalState(bundesland)
      }
    }

    return geometries
  } catch (error) {
    console.warn(error)
    return []
  }
}

function get_utm32(x, y) {
  const IN_PROJ = "EPSG:4326"
  const OUT_PROJ = "EPSG:25832"
  let loc_utm
  proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs")

  const transformer = proj4(IN_PROJ, OUT_PROJ)

  const [x_utm32, y_utm32] = transformer.forward([x, y])
  loc_utm = [x_utm32, y_utm32]
  return loc_utm
}

function get_file_names_vegetation_tif(x, y) {
  const DIVISOR = 1000
  const BUFFER_ZONE = 100
  const loc_utm = get_utm32(x, y)
  const x_utm32 = loc_utm[0]
  const y_utm32 = loc_utm[1]

  const x_rounded = Math.floor(x_utm32 / DIVISOR)
  const y_rounded = Math.floor(y_utm32 / DIVISOR)

  const load_tile_left = x_utm32 % DIVISOR < BUFFER_ZONE
  const load_tile_right = x_utm32 % DIVISOR > DIVISOR - BUFFER_ZONE
  const load_tile_lower = y_utm32 % DIVISOR < BUFFER_ZONE
  const load_tile_upper = y_utm32 % DIVISOR > DIVISOR - BUFFER_ZONE

  const file_list = [`${x_rounded}_${y_rounded}.tif.gz`]

  if (load_tile_left) {
    file_list.push(`${x_rounded - 2}_${y_rounded}.tif.gz`)
  }
  if (load_tile_right) {
    file_list.push(`${x_rounded + 2}_${y_rounded}.tif.gz`)
  }
  if (load_tile_lower) {
    file_list.push(`${x_rounded}_${y_rounded - 2}.tif.gz`)
  }
  if (load_tile_upper) {
    file_list.push(`${x_rounded}_${y_rounded + 2}.tif.gz`)
  }
  if (load_tile_left && load_tile_lower) {
    file_list.push(`${x_rounded - 2}_${y_rounded - 2}.tif.gz`)
  }
  if (load_tile_left && load_tile_upper) {
    file_list.push(`${x_rounded - 2}_${y_rounded + 2}.tif.gz`)
  }
  if (load_tile_right && load_tile_lower) {
    file_list.push(`${x_rounded + 2}_${y_rounded - 2}.tif.gz`)
  }
  if (load_tile_right && load_tile_upper) {
    file_list.push(`${x_rounded + 2}_${y_rounded + 2}.tif.gz`)
  }
  return file_list
}

// Returns vegetation Geotiff as a 2d raster for given location
export async function retrieveVegetationRasters(loc) {
  const baseurl = "https://www.openpv.de/data/vegetation/"
  var filenames = get_file_names_vegetation_tif(
    Number(loc.lon),
    Number(loc.lat)
  )

  if (filenames.length === 0) {
    return []
  }

  console.log("Location", loc)

  let fileRasterPairs = [] // Array to store tuples of [filename, rasterData]

  for (const filename of filenames) {
    let url = baseurl + filename
    console.log("Loading from ", url)

    try {
      let response = await fetch(url)
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status)
      }

      const gzData = await response.arrayBuffer()
      const decompressedData = pako.ungzip(new Uint8Array(gzData)).buffer
      const tiff = await GeoTIFF.fromArrayBuffer(decompressedData)
      const image = await tiff.getImage()
      const rasterData = await image.readRasters()

      console.log(rasterData)

      function sumRasterData(rasterData) {
        if (!Array.isArray(rasterData) || rasterData.length === 0) {
          return 0
        }
        const data = rasterData[0]
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          if (!isNaN(data[i])) {
            sum += data[i]
          }
        }
        return sum
      }

      const sum = sumRasterData(rasterData)
      console.log("Sum of raster data:", sum)

      fileRasterPairs.push([filename, rasterData]) // Add tuple of [filename, rasterData] to our array
    } catch (error) {
      console.error("Error loading or processing file:", error)
      console.error("Could not load:", filename)
      // We continue to the next file instead of returning
    }
  }

  // Return the list of tuples
  return fileRasterPairs
}
