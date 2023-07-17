import { calc_webgl, createMeshes } from "./pv_simulation";
import JSZip from "jszip";
import proj4 from "proj4";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
export var loc_utm;

import { loadLAZ } from "./lazimport";

// var state = "WaitForAddr"; // States are "WaitForAddr", "AddrDataLoaded", "Inspect"

async function getLocationFromInput(locationText) {
  let loc;
  const coordinatePattern = /^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/;

  // Check if the string matches the coordinate pattern
  if (coordinatePattern.test(locationText)) {
    const [latitude, longitude] = locationText
      .split(",")
      .map((value) => parseFloat(value.trim()));

    // Create the "loc" object with latitude and longitude attributes
    loc = {
      lat: latitude,
      lon: longitude,
    };
    return loc;
  } else {
    let url = "https://nominatim.openstreetmap.org/search?format=json&q="
      .concat(locationText)
      .concat("+Germany+Bavaria");
    let response = await fetchLocation(url);
    if (!response) {
      let locationTextModified = locationText.split(" ").join("+");
      url = "https://nominatim.openstreetmap.org/search?format=json&q=".concat(
        locationTextModified
      );
      response = await fetchLocation(url);
    }
    return response;
  }
}

async function fetchLocation(url) {
  let loc;
  const statuselem = document.getElementById("status");
  try {
    let response = await fetch(url);
    if (!response.ok) {
      console.error("Check connection to Nominatim geocoder");
      statuselem.textContent = "Connection to Adress Server failed";
      throw new Error("Request failed with status " + response.status);
    }

    let responseData = await response.json();
    if (responseData.length === 0) {
      return null;
    }

    loc = responseData[0];
    return loc;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function setLocation(
  inputValue,
  inputChanged,
  simulationParamChanged,
  loc
) {
  let newloc;
  window.mapLocationBaseChanged = true;
  if (inputChanged) {
    newloc = await getLocationFromInput(inputValue);
    window.mapLocation = newloc;
  } else if (simulationParamChanged || window.mapLocationChanged) {
    newloc = loc;
  } else {
    window.setLoading(false);
  }
  // console.log(newloc);
  if (typeof newloc !== "undefined" && newloc != null) {
    retrieveData(newloc, inputChanged);
  } else {
    window.setLoading(false);
    window.setShowThreeViewer(false);
    window.setShowErrorMessage(true);
  }

  if (inputChanged) {
    window.mapLocationChanged = false;
  }
}

function get_utm32(x, y) {
  const IN_PROJ = "EPSG:4326";
  const OUT_PROJ = "EPSG:25832";

  proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");

  const transformer = proj4(IN_PROJ, OUT_PROJ);

  const [x_utm32, y_utm32] = transformer.forward([x, y]);
  loc_utm = [x_utm32, y_utm32];
  return loc_utm;
}

function get_file_names(x, y) {
  const DIVISOR = 2000;
  const BUFFER_ZONE = 100;
  const loc_utm = get_utm32(x, y);
  const x_utm32 = loc_utm[0];
  const y_utm32 = loc_utm[1];

  const x_rounded = Math.floor(x_utm32 / DIVISOR) * 2;
  const y_rounded = Math.floor(y_utm32 / DIVISOR) * 2;

  const load_tile_left = x_utm32 % DIVISOR < BUFFER_ZONE;
  const load_tile_right = x_utm32 % DIVISOR > DIVISOR - BUFFER_ZONE;
  const load_tile_lower = y_utm32 % DIVISOR < BUFFER_ZONE;
  const load_tile_upper = y_utm32 % DIVISOR > DIVISOR - BUFFER_ZONE;

  const file_list = [`${x_rounded}_${y_rounded}.zip`];

  if (load_tile_left) {
    file_list.push(`${x_rounded - 2}_${y_rounded}.zip`);
  }
  if (load_tile_right) {
    file_list.push(`${x_rounded + 2}_${y_rounded}.zip`);
  }
  if (load_tile_lower) {
    file_list.push(`${x_rounded}_${y_rounded - 2}.zip`);
  }
  if (load_tile_upper) {
    file_list.push(`${x_rounded}_${y_rounded + 2}.zip`);
  }
  if (load_tile_left && load_tile_lower) {
    file_list.push(`${x_rounded - 2}_${y_rounded - 2}.zip`);
  }
  if (load_tile_left && load_tile_upper) {
    file_list.push(`${x_rounded - 2}_${y_rounded + 2}.zip`);
  }
  if (load_tile_right && load_tile_lower) {
    file_list.push(`${x_rounded + 2}_${y_rounded - 2}.zip`);
  }
  if (load_tile_right && load_tile_upper) {
    file_list.push(`${x_rounded + 2}_${y_rounded + 2}.zip`);
  }
  return file_list;
}

function getCommentLine(stlData) {
  // Convert the ArrayBuffer to a Uint8Array
  var uint8Array = new Uint8Array(stlData);

  // Create an empty array to store the characters
  var commentChars = [];

  // Iterate over the Uint8Array in reverse order
  for (var i = uint8Array.length - 2; i >= 0; i--) {
    // Check if the current character is a newline character
    if (uint8Array[i] === 10 || uint8Array[i] === 13) {
      // Stop iterating if a newline character is encountered
      break;
    }

    // Add the current character to the commentChars array
    commentChars.unshift(String.fromCharCode(uint8Array[i]));
  }

  // Convert the array of characters to a string
  var commentLine = commentChars.join("");

  // Remove any leading or trailing whitespace
  commentLine = commentLine.trim();
  return commentLine;
}

function parseCommentLine(comment) {
  // Regular expression pattern to match the comment line format
  var pattern =
    /^;\s*offset\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*$/i;

  // Match the comment line against the pattern
  var match = comment.match(pattern);

  var offset = [0, 0, 0];
  // Check if the comment line matches the expected format
  if (match) {
    // Extract the offsets from the matched groups
    console.log("Matches", match);
    offset = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];

    // Print the offsets
    console.log("Offsets:", offset[0], offset[1], offset[2]);
  } else {
    console.log("Invalid comment format");
  }
  return offset;
}

async function retrieveData(loc, resetCamera = false) {
  const baseurl = "https://www.openpv.de/data/";
  var filenames = get_file_names(Number(loc.lon), Number(loc.lat));
  if (filenames.length == 0) {
    return;
  }

  const status_elem = document.getElementById("status");

  // Create an array to store individual geometries
  let geometries = [];
  let zipData = null;
  var cached_file_found = false;
  var main_offset = null;
  console.log("Location", loc);
  const loc_utm32 = get_utm32(Number(loc.lon), Number(loc.lat));
  // Iterate through all filenames
  for (const filename of filenames) {
    let filename_idx;
    if (window.stlFile != null) {
      filename_idx = window.stlFiles.indexOf(filename);
    } else {
      filename_idx = -1;
    }
    if (filename_idx != -1) {
      zipData = window.stlDataCached[filename_idx];
      cached_file_found = true;
      console.log("Use cached file!!");
    } else {
      let url = baseurl + filename;

      if (url == "https://www.openpv.de/data/688_5388.zip") {
        url = "./688_5388.zip";
      }

      status_elem.textContent = "Loading from " + url;

      try {
        // Download the zipped STL file
        let response;
        response = await fetch(url);
        if (!response.ok) {
          throw new Error("Request failed with status " + response.status);
        }
        zipData = await response.arrayBuffer();
        if (!cached_file_found) {
          window.stlDataCached = [zipData];
          window.stlFiles = [filename];
        } else {
          window.stlDataCached.append(zipData);
          window.stlFiles.append(filename);
        }
      } catch (error) {
        window.setLoading(false);
        window.setShowErrorMessage(true);
        return;
      }
    }

    // Unzip the zipped STL file
    const zip = new JSZip();
    await zip.loadAsync(zipData);

    // Get the STL file from the unzipped contents
    const stlFile = zip.file(Object.keys(zip.files)[0]);
    if (stlFile) {
      // Load the STL file
      const stlData = await stlFile.async("arraybuffer");
      stlDataCached = stlData;

      // Parse the STL data and add the geometry to the geometries array
      let geometry = new STLLoader().parse(stlData);

      // Create and display the combined mesh
      const comment = getCommentLine(stlData);
      var local_offset = parseCommentLine(comment);

      if (main_offset == null) {
        main_offset = local_offset;
        local_offset = [0, 0, 0];
      } else {
        local_offset = [
          local_offset[0] - main_offset[0],
          local_offset[1] - main_offset[1],
          local_offset[2] - main_offset[2],
        ];
        geometry.translate(local_offset[0], local_offset[1], local_offset[2]);
      }
      console.log("OFFSETS", main_offset, local_offset);
      geometries.push(geometry);
      // Merge geometries using BufferGeometryUtils
      const combinedGeometry = BufferGeometryUtils.mergeGeometries(geometries);

      const minZ = createMeshes(combinedGeometry, main_offset);
      const offsetUTM32 = [loc_utm32[0], loc_utm32[1], minZ + main_offset[2]];

      console.log("OffsetUTM32:", offsetUTM32);
      const laser_points = await loadLAZ(100, offsetUTM32);
      console.log(`Finished loading points ${laser_points.length}`);

      //showMeshOrig();
      calc_webgl(loc, laser_points, resetCamera);
    } else {
      console.error("STL file not found in ZIP archive");
    }
  }
}
