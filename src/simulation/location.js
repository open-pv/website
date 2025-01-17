/** x, y tile coordinates in WebMercator XYZ tiling at zoom level X=15
 */
export var coordinatesXY15, coordinatesLonLat, coordinatesWebMercator

export async function requestLocation(searchString) {
  let options = extractLongitudeLatitude(searchString)
  if (options.length == 0) {
    options = processAddress(searchString)
  }
  return options
}

function extractLongitudeLatitude(searchString) {
  if (/^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/.test(searchString)) {
    const [lat, lon] = searchString
      .split(',')
      .map((value) => parseFloat(value.trim()))
    return [
      {
        lat,
        lon,
        display_name: `${lat},${lon}`,
        key: 'coordinates',
      },
    ]
  } else {
    return []
  }
}

async function processAddress(searchString) {
  let url =
    'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q='
      .concat(searchString)
      .concat('+Germany')
  let response = await fetchCoordinates(url)
  if (!response) {
    url =
      'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q='.concat(
        searchString.split(' ').join('+'),
      )
    response = await fetchCoordinates(url)
  }
  return response.map((obj) => {
    console.log(obj.boundingbox)
    let [lat0, lat1, lon0, lon1] = obj.boundingbox.map(parseFloat)
    return {
      lat: obj.lat,
      lon: obj.lon,
      key: obj.place_id,
      addressType: obj.addresstype,
      boundingBox: [lon0, lat0, lon1, lat1],
      display_name: format_address(obj.address),
    }
  })
}

function format_address(address) {
  const part1 = (address.road || '') + ' ' + (address.house_number || '')
  const part2 = (address.postcode || '') + ' ' + (address.city || '')

  if (part1 != ' ' && part2 != ' ') {
    return part1 + ', ' + part2
  } else {
    return part1 + part2
  }
}

async function fetchCoordinates(url) {
  try {
    const response = await fetch(url)
    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`)
    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export function projectToWebMercator(lon, lat) {
  coordinatesLonLat = [lon, lat]
  const lat_rad = (lat * Math.PI) / 180.0
  const n = Math.pow(2, 15)
  const xtile = n * ((lon + 180) / 360)
  const ytile =
    (n * (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI)) /
    2
  coordinatesXY15 = [xtile, ytile]
  coordinatesWebMercator = [
    1222.992452 * xtile - 20037508.34,
    20037508.34 - 1222.992452 * ytile,
  ]
  return [xtile, ytile]
}

export function xyzBounds(x, y, z) {
  const map_size = 40075016.68
  const tile_size = map_size / Math.pow(2, z)
  const x0 = tile_size * x - map_size / 2
  const x1 = x0 + tile_size
  const y0 = map_size / 2 - tile_size * y
  const y1 = y0 - tile_size

  return [x0, y0, x1, y1]
}
