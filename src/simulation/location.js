import proj4 from "proj4"

/** x, y tile coordinates in WebMercator XYZ tiling at zoom level X=15
 */
export var coordinatesXY15, coordinatesLonLat

export async function requestLocation(inputValue, inputChanged, loc) {
  let newloc
  window.mapLocationBaseChanged = true
  if (inputChanged) {
    newloc = await getCoordinatesFromSearchString(inputValue)
    window.mapLocation = newloc
  } else {
    newloc = loc
  }
  return newloc
}

export async function getCoordinatesFromSearchString(searchString) {
  let coordinates
  if (isLongitudeLatitude(searchString)) {
    coordinates = processLongitudeLatitude(searchString)
  } else {
    coordinates = await processAdress(searchString)
  }
  return coordinates
}

function isLongitudeLatitude(searchString) {
  return /^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/.test(searchString)
}

function processLongitudeLatitude(searchString) {
  const [lat, lon] = searchString
    .split(",")
    .map((value) => parseFloat(value.trim()))
  return { lat, lon }
}

async function processAdress(searchString) {
  let url = "https://nominatim.openstreetmap.org/search?format=json&q="
    .concat(searchString)
    .concat("+Germany")
  let response = await fetchCoordinates(url)
  if (!response) {
    url = "https://nominatim.openstreetmap.org/search?format=json&q=".concat(
      searchString.split(" ").join("+")
    )
    response = await fetchCoordinates(url)
  }
  return response
}

async function fetchCoordinates(url) {
  try {
    const response = await fetch(url)
    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`)
    const responseData = await response.json()
    return responseData.length > 0 ? responseData[0] : null
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export function projectToWebMercator(lon, lat) {
  console.log(`Projecting ${lon}E ${lat}N`)
  coordinatesLonLat = [lon, lat]
  const lat_rad = (lat * Math.PI) / 180.0
  const n = Math.pow(2, 15)
  const xtile = n * ((lon + 180) / 360)
  const ytile =
    (n * (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI)) /
    2
  console.log(`Tile ${xtile},${ytile}`)
  coordinatesXY15 = [xtile, ytile]
  return [xtile, ytile]
}
