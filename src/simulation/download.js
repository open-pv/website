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


export async function downloadVegetationHeightmap(bbox) {
  const url = 'http://188.245.158.226/data/vegetation_heightmap_webmercator_bigtiff.tif';

  try {
    console.log("Attempting to open GeoTIFF file...");
    const tiff = await GeoTIFF.fromUrl(url, { allowHttpRangeRequests: true });  // Enable HTTP range requests
    console.log("GeoTIFF file opened successfully");
    const image = await tiff.getImage();
    console.log("Image metadata retrieved");

    const fileDirectory = image.getFileDirectory();
    const [imageWidth, imageHeight] = [image.getWidth(), image.getHeight()];
    const [tileWidth, tileHeight] = [image.getTileWidth(), image.getTileHeight()];
    console.log("Image dimensions:", imageWidth, "x", imageHeight);
    console.log("Tile dimensions:", tileWidth, tileHeight);

    const geoKeys = fileDirectory.GeoKeyDirectory;
    if (geoKeys) {
      console.log("GeoKeys:", geoKeys);
    }

    const tiepoint = fileDirectory.ModelTiepoint;
    const scale = fileDirectory.ModelPixelScale;
    if (!tiepoint || !scale) {
      throw new Error("Missing tiepoint or scale information");
    }
    console.log("Tiepoint:", tiepoint);
    console.log("Scale:", scale);

    const [i, j, k, x, y, z] = tiepoint;
    const [scaleX, scaleY, scaleZ] = scale;

    const [minX, minY, maxX, maxY] = image.getBoundingBox();
    console.log("GeoTIFF bounding box:", [minX, minY, maxX, maxY]);
    console.log("Requested bounding box:", bbox);

    // Calculate pixel coordinates
    let startX = Math.floor((bbox[0] - x) / scaleX);
    let startY = Math.floor((y - bbox[3]) / scaleY);
    let endX = Math.ceil((bbox[2] - x) / scaleX);
    let endY = Math.ceil((y - bbox[1]) / scaleY);

    // Ensure the window is within the image bounds
    startX = Math.max(0, startX);
    startY = Math.max(0, startY);
    endX = Math.min(imageWidth - 1, endX);
    endY = Math.min(imageHeight - 1, endY);

    let windowWidth = endX - startX;
    let windowHeight = endY - startY;

    console.log(`Calculated window: [${startX}, ${startY}, ${windowWidth}, ${windowHeight}]`);

    if (windowWidth <= 0 || windowHeight <= 0) {
      throw new Error("Invalid window dimensions");
    }

    const window = [startX, startY, endX, endY];

    // Read the raster data for the specified window
    console.log("Reading raster data...");
    const [rasterData] = await image.readRasters({ window });
    console.log("Raster data read successfully");
    console.log(`Raster data shape: ${windowWidth}x${windowHeight}`);

    const result = {
      data: rasterData,
      bbox: [
        x + startX * scaleX,
        y - (startY + windowHeight) * scaleY,
        x + (startX + windowWidth) * scaleX,
        y - startY * scaleY
      ],
      width: windowWidth,
      height: windowHeight,
      xResolution: scaleX,
      yResolution: scaleY
    };

    //console.log("Result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error loading or processing GeoTIFF:", error);
    console.error("Error stack:", error.stack);
    return null;
  }
}


// Keep other functions in this file as they are