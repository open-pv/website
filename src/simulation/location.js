import { useTranslation } from "react-i18next";

/** x, y tile coordinates in WebMercator XYZ tiling at zoom level X=15
 */
export var coordinatesXY15, coordinatesLonLat

export async function requestLocation(searchString) {
  let options = extractLongitudeLatitude(searchString);
  if(options.length == 0) {
    options = processAddress(searchString);
  }
  return options
}

function extractLongitudeLatitude(searchString) {
  const { t } = useTranslation();

  if(/^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/.test(searchString)) {
    const [lat, lon] = searchString
      .split(",")
      .map((value) => parseFloat(value.trim()))
    return [ {
      lat,
      lon,
      display_name: `${t('map.coordinates')}: ${lat},${lon}`, 
      key: 'coordinates',
    } ];
  } else {
    return [];
  }
}

async function processAddress(searchString) {
  let url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q="
    .concat(searchString)
    .concat("+Germany")
  let response = await fetchCoordinates(url)
  if (!response) {
    url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=".concat(
      searchString.split(" ").join("+")
    )
    response = await fetchCoordinates(url)
  }
  return response.map(obj => ({
    lat: obj.lat,
    lon: obj.lon,
    key: obj.place_id,
    display_name: format_address(obj.address)
  }));
}

function format_address(address) {
  let addr = 
    (address.road || '') + ' ' +
    (address.house_number || '') + ', ' +
    (address.postcode || '') + ' ' +
    (address.city || '');
  return addr
}

async function fetchCoordinates(url) {
  try {
    const response = await fetch(url)
    if (!response.ok)
      throw new Error(`Request failed with status ${response.status}`)
    const responseData = await response.json()
    return responseData;
  } catch (error) {
    console.error("Error:", error)
    return [];
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
  return [xtile, ytile]
}
