import JSZip from "jszip"
import { projectToUTM32 } from "./location"
export var coordinatesUTM32

function getFileNames(x, y) {
  const DIVISOR = 2000
  const BUFFER_ZONE = 100
  let [xUTM32, yUTM32] = projectToUTM32(x, y)

  const xUTM32Rounded = Math.floor(xUTM32 / DIVISOR) * 2
  const yUTM32Rounded = Math.floor(yUTM32 / DIVISOR) * 2

  const loadTileLeft = xUTM32 % DIVISOR < BUFFER_ZONE
  const loadTileRight = xUTM32 % DIVISOR > DIVISOR - BUFFER_ZONE
  const loadTileLower = yUTM32 % DIVISOR < BUFFER_ZONE
  const loadTileUpper = yUTM32 % DIVISOR > DIVISOR - BUFFER_ZONE

  const files = [`${xUTM32Rounded}_${yUTM32Rounded}.zip`]

  if (loadTileLeft) {
    files.push(`${xUTM32Rounded - 2}_${yUTM32Rounded}.zip`)
  }
  if (loadTileRight) {
    files.push(`${xUTM32Rounded + 2}_${yUTM32Rounded}.zip`)
  }
  if (loadTileLower) {
    files.push(`${xUTM32Rounded}_${yUTM32Rounded - 2}.zip`)
  }
  if (loadTileUpper) {
    files.push(`${xUTM32Rounded}_${yUTM32Rounded + 2}.zip`)
  }
  if (loadTileLeft && loadTileLower) {
    files.push(`${xUTM32Rounded - 2}_${yUTM32Rounded - 2}.zip`)
  }
  if (loadTileLeft && loadTileUpper) {
    files.push(`${xUTM32Rounded - 2}_${yUTM32Rounded + 2}.zip`)
  }
  if (loadTileRight && loadTileLower) {
    files.push(`${xUTM32Rounded + 2}_${yUTM32Rounded - 2}.zip`)
  }
  if (loadTileRight && loadTileUpper) {
    files.push(`${xUTM32Rounded + 2}_${yUTM32Rounded + 2}.zip`)
  }
  return files
}

function get_file_names_laz(x, y) {
  const DIVISOR = 1000
  const BUFFER_ZONE = 100
  const loc_utm = projectToUTM32(x, y)
  const x_utm32 = loc_utm[0]
  const y_utm32 = loc_utm[1]

  const x_rounded = Math.floor(x_utm32 / DIVISOR)
  const y_rounded = Math.floor(y_utm32 / DIVISOR)

  const load_tile_left = x_utm32 % DIVISOR < BUFFER_ZONE
  const load_tile_right = x_utm32 % DIVISOR > DIVISOR - BUFFER_ZONE
  const load_tile_lower = y_utm32 % DIVISOR < BUFFER_ZONE
  const load_tile_upper = y_utm32 % DIVISOR > DIVISOR - BUFFER_ZONE

  const file_list = [`${x_rounded}_${y_rounded}.laz`]

  if (load_tile_left) {
    file_list.push(`${x_rounded - 2}_${y_rounded}.laz`)
  }
  if (load_tile_right) {
    file_list.push(`${x_rounded + 2}_${y_rounded}.laz`)
  }
  if (load_tile_lower) {
    file_list.push(`${x_rounded}_${y_rounded - 2}.laz`)
  }
  if (load_tile_upper) {
    file_list.push(`${x_rounded}_${y_rounded + 2}.laz`)
  }
  if (load_tile_left && load_tile_lower) {
    file_list.push(`${x_rounded - 2}_${y_rounded - 2}.laz`)
  }
  if (load_tile_left && load_tile_upper) {
    file_list.push(`${x_rounded - 2}_${y_rounded + 2}.laz`)
  }
  if (load_tile_right && load_tile_lower) {
    file_list.push(`${x_rounded + 2}_${y_rounded - 2}.laz`)
  }
  if (load_tile_right && load_tile_upper) {
    file_list.push(`${x_rounded + 2}_${y_rounded + 2}.laz`)
  }
  return file_list
}

export async function downloadBuildings(loc) {
  const filenames = getFileNames(Number(loc.lon), Number(loc.lat))
  let stlStrings = []

  for (let filename of filenames) {
    let zippedData = await downloadFile(filename)
    if (!zippedData) {
      throw new Error("File download failed!")
    }

    stlStrings.push(await unzipFile(zippedData));
  }

  return stlStrings;
}

async function downloadFile(filename) {
  let url = "https://www.openpv.de/data/" + filename
  console.log(url)
  try {
    let response = await fetch(url)

    if (!response.ok) {
      throw new Error("Request failed with status " + response.status)
    }
    let zippedData = await response.arrayBuffer()
    console.log("zippedData")
    console.log(zippedData)

    return zippedData
  } catch (error) {
    console.log(error);
    window.setLoading(false)
    window.setShowErrorMessage(true)
    return
  }
}

async function unzipFile(zippedData) {
  console.log("zipfile")
  console.log(zippedData)
  const zip = new JSZip()
  await zip.loadAsync(zippedData)

  const stlFile = zip.file(Object.keys(zip.files)[0])

  let stlData = await stlFile.async("arraybuffer")

  if (!stlData) {
    console.error("STL file not found in ZIP archive")
  }
  return stlData
}
