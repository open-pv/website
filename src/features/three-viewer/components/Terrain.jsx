import { useContext, useEffect, useState } from 'react'
import * as THREE from 'three'
import { SONNY_DEM } from '@/features/simulation/core/elevation'
import { coordinatesXY15, xyzBounds } from '@/features/simulation/core/location'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'

/** Load an OSM map tile and return it as a THREE Mesh
 */
const TerrainTile = (props) => {
  const zoom = props.zoom
  const tx = props.x
  const ty = props.y
  const divisions = props.divisions

  const url = `https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/${zoom}/${ty}/${tx}.png`

  let [geometry, setGeometry] = useState(null)
  let [material, setMaterial] = useState(null)
  let [meshLoaded, setMeshLoaded] = useState(false)

  let mesh = (
    <>{meshLoaded && <mesh geometry={geometry} material={material} />}</>
  )

  useEffect(() => {
    async function fetchData() {
      const mapFuture = new THREE.TextureLoader().loadAsync(url)

      // Size of the world map in meters
      const [x0, y0, x1, y1] = xyzBounds(tx, ty, zoom)
      let vertices = []
      let uvs = []
      let indices = []
      let i = 0

      const row = divisions + 1
      for (let ty = 0; ty <= divisions; ty++) {
        for (let tx = 0; tx <= divisions; tx++) {
          const x = x0 + (tx / divisions) * (x1 - x0)
          const y = y0 + (ty / divisions) * (y1 - y0)
          vertices.push(SONNY_DEM.toPoint3D(x, y))
          // UV mapping for the texture
          uvs.push(tx / divisions, 1.0 - ty / divisions)
          // Triangle indices
          if (tx > 0 && ty > 0) {
            indices.push(
              i - row - 1,
              i - 1,
              i - row, // 1st triangle
              i - row,
              i - 1,
              i, // 2nd triangle
            )
          }
          i += 1
        }
      }

      vertices = await Promise.all(vertices)
      const vertexBuffer = new Float32Array(vertices.flatMap((x) => x.point))
      const normalBuffer = new Float32Array(vertices.flatMap((x) => x.normal))
      const uvBuffer = new Float32Array(uvs)
      const indexBuffer = new Uint32Array(indices)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(vertexBuffer, 3),
      )
      geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(normalBuffer, 3),
      )
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvBuffer, 2))
      geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1))

      setGeometry(geometry)
      const map = await mapFuture
      map.colorSpace = THREE.SRGBColorSpace
      setMaterial(
        new THREE.MeshBasicMaterial({
          map: await mapFuture,
          side: THREE.FrontSide,
        }),
      )
      setMeshLoaded(true)
    }
    fetchData()
  }, [])

  return mesh
}

const Terrain = () => {
  const sceneContext = useContext(SceneContext)
  const [x, y] = coordinatesXY15
  const [tiles, setTiles] = useState([]) // State to manage tiles
  const tx = Math.floor(x * 16)
  const ty = Math.floor(y * 16)

  let xys = []
  for (let dx = -11; dx <= 11; dx++) {
    for (let dy = -11; dy <= 11; dy++) {
      xys.push({ dx, dy, divisions: 2 })
    }
  }

  xys.sort((a, b) => a.dx * a.dx + a.dy * a.dy - (b.dx * b.dx + b.dy * b.dy))
  useEffect(() => {
    let currentTiles = []

    // Function to load tiles progressively
    const loadTiles = (index) => {
      if (index < xys.length) {
        const { dx, dy, divisions } = xys[index]
        const key = `${tx + dx}-${ty + dy}-${19}`
        currentTiles.push(
          <TerrainTile
            key={key}
            x={tx + dx}
            y={ty + dy}
            divisions={divisions}
            zoom={19}
          />,
        )

        setTiles([...currentTiles]) // Update the state with the new set of tiles

        // Schedule the next tile load
        setTimeout(() => loadTiles(index + 1), 0) // Adjust the timeout for desired loading speed
      }
    }

    loadTiles(0) // Start loading tiles

    return () => {
      setTiles([]) // Clean up on component unmount
    }
  }, [tx, ty]) // Dependency array to reset when the coordinates change

  return <group visible={sceneContext.showTerrain}>{tiles}</group>
}

export default Terrain
