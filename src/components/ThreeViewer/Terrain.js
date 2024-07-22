import React, { useEffect, useState } from "react"
import * as THREE from "three"
import { TILE2METERS } from "../../simulation/download"
import { coordinatesXY15 } from "../../simulation/location"

/** Load an OSM map tile and return it as a THREE Mesh
 */
async function loadMapTile(tx, ty, zoom) {
  const url = `https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/${zoom}/${ty}/${tx}.png`
  const mapFuture = new THREE.TextureLoader().loadAsync(url)

  if (zoom < 12) {
    console.error("DEM is broken for zoom < 12!")
  }

  const shift = zoom - 12
  // const dem_url = `https://maps.heidler.info/dem-tiles-12/12/${tx >> shift}/${ty >> shift}.png`;
  const dem_url = `https://web3d.basemap.de/maplibre/dgm5-rgb/12/${
    tx >> shift
  }/${ty >> shift}.png`
  const demFuture = new THREE.TextureLoader().loadAsync(dem_url)

  // DEM Processing
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  const dem = await demFuture
  canvas.width = dem.image.width
  canvas.height = dem.image.height
  context.drawImage(dem.image, 0, 0, canvas.width, canvas.height)

  function sampleDEM(fraction_x, fraction_y) {
    // Ensure x and y are within bounds
    if (
      fraction_x >= 0 &&
      fraction_x <= 1 &&
      fraction_y >= 0 &&
      fraction_y <= 1
    ) {
      const x0 = tx - ((tx >> shift) << shift)
      const y0 = ty - ((ty >> shift) << shift)
      const s = 1 << shift
      const x = Math.round(((fraction_x + x0) / s) * (canvas.width - 1))
      const y = Math.round(((fraction_y + y0) / s) * (canvas.height - 1))
      // Get image data at the specific (x, y) location
      const pixelData = context.getImageData(x, y, 1, 1).data
      const [r, g, b, _] = pixelData
      const height = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1
      return height
    }
  }

  const scale = 1 << (zoom - 15)
  // TODO: Subdivide
  const corners = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]
  const vertices = corners.flatMap(([x, y]) => [
    // [[tx, ty], [tx+1, ty], [tx, ty+1], [tx+1, ty+1]];
    TILE2METERS * ((tx + x) / scale - coordinatesXY15[0]),
    -TILE2METERS * ((ty + y) / scale - coordinatesXY15[1]),
    sampleDEM(x, y),
  ])

  const vertexBuffer = new Float32Array(vertices)
  // UV mapping for the texture
  const uvs = new Float32Array([0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0])
  // Triangle indices
  const indices = new Uint32Array([0, 2, 1, 1, 2, 3])
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(vertexBuffer, 3))
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))

  const material = new THREE.MeshBasicMaterial({
    map: await mapFuture,
    side: THREE.DoubleSide,
  })

  return <mesh geometry={geometry} material={material} />
}

const Terrain = () => {
  const [meshData, setMeshData] = useState(null)

  const [x, y] = coordinatesXY15
  useEffect(() => {
    async function fetchData() {
      const tx = Math.floor(x * 16)
      const ty = Math.floor(y * 16)

      let futures = []
      for (let dx = -11; dx <= 11; dx++) {
        for (let dy = -11; dy <= 11; dy++) {
          futures.push(loadMapTile(tx + dx, ty + dy, 19))
        }
      }
      const meshes = await Promise.all(futures)
      setMeshData(meshes)
    }
    fetchData()
  }, [])

  if (!meshData) {
    return null // or a loading indicator
  }

  return <>{meshData}</>
}

export default Terrain