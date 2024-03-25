import JSZip from "jszip"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"
import { projectToUTM32 } from "./location"
import { createMeshes } from "./pv_simulation"
export var coordinatesUTM32

import { loadLAZ } from "./lazimport"

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

function getCommentLine(stlData) {
  // TODO: Do not refactor this, as we do not want to communicate the offet
  // over an stl comment in the future

  // Convert the ArrayBuffer to a Uint8Array
  var uint8Array = new Uint8Array(stlData)

  // Create an empty array to store the characters
  var commentChars = []

  // Iterate over the Uint8Array in reverse order
  for (var i = uint8Array.length - 2; i >= 0; i--) {
    // Check if the current character is a newline character
    if (uint8Array[i] === 10 || uint8Array[i] === 13) {
      // Stop iterating if a newline character is encountered
      break
    }

    // Add the current character to the commentChars array
    commentChars.unshift(String.fromCharCode(uint8Array[i]))
  }

  // Convert the array of characters to a string
  var commentLine = commentChars.join("")

  // Remove any leading or trailing whitespace
  commentLine = commentLine.trim()
  return commentLine
}

function parseCommentLine(comment) {
  // Regular expression pattern to match the comment line format
  var pattern =
    /^;\s*offset\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*$/i

  // Match the comment line against the pattern
  var match = comment.match(pattern)

  var offset = [0, 0, 0]
  // Check if the comment line matches the expected format
  if (match) {
    // Extract the offsets from the matched groups
    console.log("Matches", match)
    offset = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]

    // Print the offsets
    console.log("Offsets:", offset[0], offset[1], offset[2])
  } else {
    console.log("Invalid comment format")
  }
  return offset
}

export async function downloadBuildings(loc, resetCamera = false) {
  var filenames = getFileNames(Number(loc.lon), Number(loc.lat))
  console.log("filenames")
  console.log(filenames)
  if (filenames.length == 0) {
    return
  }

  let geometries = []
  let stlData = null
  let main_offset = null

  const coordinatesUTM32 = projectToUTM32(Number(loc.lon), Number(loc.lat))

  for (let filename of filenames) {
    let zippedData = await downloadFile(filename)
    if (!zippedData) {
      throw new Error("File download failed!")
    }

    stlData = await unzipFile(zippedData)

    let geometry = new STLLoader().parse(stlData)

    // Create and display the combined mesh
    const comment = getCommentLine(stlData)
    var local_offset = parseCommentLine(comment)

    if (main_offset == null) {
      main_offset = local_offset
      local_offset = [0, 0, 0]
    } else {
      local_offset = [
        local_offset[0] - main_offset[0],
        local_offset[1] - main_offset[1],
        local_offset[2] - main_offset[2],
      ]
      geometry.translate(local_offset[0], local_offset[1], local_offset[2])
    }

    geometries.push(geometry)
  }
  console.log(geometries)
  console.log("These were the geometries!")

  //TODO: Why do we not create a full list of geometries and then process it further?
  const combinedGeometry = BufferGeometryUtils.mergeGeometries(geometries)

  const minZ = createMeshes(combinedGeometry, main_offset)
  const offsetUTM32 = [
    coordinatesUTM32[0],
    coordinatesUTM32[1],
    minZ + main_offset[2],
  ]

  let laser_points = null
  if (window.enableLaserPoints) {
    laser_points = await loadLAZ(
      50,
      offsetUTM32,
      get_file_names_laz(Number(loc.lon), Number(loc.lat))
    )
  }
  return { loc, laser_points, resetCamera }
}

async function downloadFile(filename) {
  let url = "https://www.openpv.de/data/" + filename
  console.log(url)
  try {
    let response = await fetch(url)

    if (!response.ok) {
      throw new Error("Request failed with status " + response.status)
    }
    zippedData = await response.arrayBuffer()
    console.log("zippedData")
    console.log(zippedData)

    return zippedData
  } catch (error) {
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

  stlData = await stlFile.async("arraybuffer")

  if (!stlData) {
    console.error("STL file not found in ZIP archive")
  }
  return stlData
}
