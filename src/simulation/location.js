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
