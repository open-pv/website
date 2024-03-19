import proj4 from "proj4"
export var coordinatesUTM32

export async function setLocation(inputValue, inputChanged, loc) {
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
    .concat("+Germany+Bavaria")
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

export function projectToUTM32(lat, lon) {
  const IN_PROJ = "EPSG:4326"
  const OUT_PROJ = "EPSG:25832"

  proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs")

  const transformer = proj4(IN_PROJ, OUT_PROJ)
  coordinatesUTM32 = transformer.forward([lat, lon])

  return coordinatesUTM32
}
