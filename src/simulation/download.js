import { calc_webgl, createMeshes } from "./pv_simulation";
import JSZip from "jszip";
import proj4 from "proj4";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
export var loc_utm;
export var stlDataCached = null;

var state = "WaitForAddr"; // States are "WaitForAddr", "AddrDataLoaded", "Inspect"

async function getLocationFromInput(locationText) {
  let loc;
  const coordinatePattern = /^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/;    
  
  // Check if the string matches the coordinate pattern
  if (coordinatePattern.test(locationText)) {
    const [latitude, longitude] = locationText.split(",").map((value) => parseFloat(value.trim()));

    // Create the "loc" object with latitude and longitude attributes
    loc = {
      lat: latitude,
      lon: longitude
    };
    return loc;
  } else {
      
    let url = "https://nominatim.openstreetmap.org/search?format=json&q=".concat(locationText).concat("+Germany+Bavaria");
    let response = await fetchLocation(url);
    if (!response) {
      let locationTextModified = locationText.split(" ").join("+");
      url = "https://nominatim.openstreetmap.org/search?format=json&q=".concat(locationTextModified);
      response = await fetchLocation(url);
    }
    return response;
  }
}

async function fetchLocation(url) {
  let loc;
  const statuselem = document.getElementById('status');
  try {
    let response = await fetch(url);
    if (!response.ok) {
      console.error('Check connection to Nominatim geocoder');
      statuselem.textContent = "Connection to Adress Server failed";
      throw new Error('Request failed with status ' + response.status);
    }
    
    let responseData = await response.json();
    if (responseData.length === 0) {
      return null; 
    }

    loc = responseData[0];
    return loc;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}



export async function setLocation(inputValue){
  

  const loc = await getLocationFromInput(inputValue);
  if (typeof loc !== 'undefined') {
    retrieveData(loc);
  }
  else {
    window.setLoading(false);
    window.setShowThreeViewer(false);
    window.setShowErrorMessage(true);
  }
}



function get_file_names(x, y) {
    const DIVISOR = 2000;
    const BUFFER_ZONE = 100;
    const IN_PROJ = 'EPSG:4326';
    const OUT_PROJ = 'EPSG:25832';
  
    proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
  
    const transformer = proj4(IN_PROJ, OUT_PROJ);

  
    const [x_utm32, y_utm32] = transformer.forward([x, y]);
    loc_utm = [x_utm32, y_utm32];

  
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
  
  async function retrieveData(loc) {
    const baseurl = "https://www.openpv.de/data/";
    var filenames = get_file_names(Number(loc.lon), Number(loc.lat));
    if (filenames.length == 0) {
      return;
    }
  
    const status_elem = document.getElementById("status");
  
    // Create an array to store individual geometries
    let geometries = [];
  
    // Iterate through all filenames
    for (const filename of filenames) {
      let url = baseurl + filename;
      status_elem.textContent = "Loading from " + url;
  
      try {
        // Download the zipped STL file
        const response = await fetch(url);
        const zipData = await response.arrayBuffer();
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
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
          geometries.push(geometry);
          // Merge geometries using BufferGeometryUtils
          const combinedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
        
          // Create and display the combined mesh
          createMeshes(combinedGeometry);
          //showMeshOrig();
          calc_webgl(loc);
        } else {
          console.error("STL file not found in ZIP archive");
        }
      } catch (error) {
        window.setLoading(false);
        window.setShowErrorMessage(true);
      }
    }
  
    
    
  }
  
  
