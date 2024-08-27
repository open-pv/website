import React, { useEffect, useState } from "react"
import * as THREE from "three"
import { tile2meters, mercator2meters } from "../../simulation/download"
import { coordinatesWebMercator, coordinatesXY15, xyzBounds } from "../../simulation/location"
import * as geotiff from 'geotiff';

class ElevationManager {
  static instancePromise = null;
  static state = 'uninitialized';

  tiff = null;
  image = null;
  width = -1;
  height = -1;
  boundingBox = [0, 0, 0, 0];

  static async toPoint3D(x, y) {
    const me = await this.getInstance(); 
    const px = (x - me.tiepoint[3]) / me.pixelScale[0]
    const py = (y - me.tiepoint[4]) / -me.pixelScale[1]

    // Retrieve pixel data
    const rasterData = await me.image.readRasters({ window: [
      Math.floor(px), Math.floor(py),
      Math.ceil(px)+1, Math.ceil(py)+1] });

    // bilinear interpolation
    const tx = px % 1;
    const ty = py % 1;
    const qx = 1 - tx;
    const qy = 1 - ty;
    const z = qx * qy * rasterData[0][0] +
              qx * ty * rasterData[0][2] +
              tx * qy * rasterData[0][1] +
              tx * ty * rasterData[0][3];
    return [x, y, z];
  }

  static async getInstance() {
    if (!this.instancePromise) {
      this.instancePromise = this.init();
    }
    return this.instancePromise;
  }
  
  static async init() {
    this.instance = new ElevationManager();
    let me = this.instance
    me.tiff = await geotiff.fromUrl('https://maps.heidler.info/sonny_dtm_20.tif');
    me.image = await this.instance.tiff.getImage();
    me.pixelScale = me.image.fileDirectory.ModelPixelScale;
    me.tiepoint = me.image.fileDirectory.ModelTiepoint;
    return me
  }
}


/** Load an OSM map tile and return it as a THREE Mesh
 */
const TerrainTile = (props) => {
  const zoom = props.zoom
  const tx = props.x
  const ty = props.y
  const divisions = props.divisions;

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
      const [x0, y0, x1, y1] = xyzBounds(tx, ty, zoom);
      let points = [];
      let uvs = [];
      let indices = [];
      let i = 0;

      const row = divisions+1;
      for (let ty = 0; ty <= divisions; ty++) {
        for (let tx = 0; tx <= divisions; tx++) {
          const x = x0 + tx / divisions * (x1 - x0);
          const y = y0 + ty / divisions * (y1 - y0);
          points.push(ElevationManager.toPoint3D(x, y));
          // UV mapping for the texture
          uvs = uvs.concat([tx / divisions, 1.0 - ty / divisions]);
          // Triangle indices
          if(tx > 0 && ty > 0) {
            indices = indices.concat([
              i-row-1, i-1, i-row, // 1st triangle
              i-row, i-1, i // 2nd triangle
            ]);
          }
          i += 1;
        }
      }

      const vertices = (await Promise.all(points)).flatMap(([x, y, z]) => [
        mercator2meters() * (x - coordinatesWebMercator[0]),
        mercator2meters() * (y - coordinatesWebMercator[1]),
        z
      ])
      const vertexBuffer = new Float32Array(vertices)
      const uvBuffer = new Float32Array(uvs)
      const indexBuffer = new Uint32Array(indices);
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(vertexBuffer, 3)
      )
      geometry.setAttribute("uv", new THREE.BufferAttribute(uvBuffer, 2))
      geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1))

      setGeometry(geometry)
      const map = await mapFuture;
      map.colorSpace = THREE.SRGBColorSpace;
      setMaterial(
        new THREE.MeshLambertMaterial({
          flatShading: false,
          map: await mapFuture,
          side: THREE.FrontSide,
        })
      )
      setMeshLoaded(true)
    }
    fetchData()
  }, [])

  return mesh
}

const Terrain = ({visible}) => {
  const [x, y] = coordinatesXY15
  const [tiles, setTiles] = useState([]); // State to manage tiles
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
    let currentTiles = [];

    // Function to load tiles progressively
    const loadTiles = (index) => {
      if (index < xys.length) {
        const { dx, dy, divisions } = xys[index];
        const key = `${tx + dx}-${ty + dy}-${19}`;
        currentTiles.push(<TerrainTile key={key} x={tx + dx} y={ty + dy} divisions={divisions} zoom={19} />);

        setTiles([...currentTiles]); // Update the state with the new set of tiles

        // Schedule the next tile load
        setTimeout(() => loadTiles(index + 1), 10); // Adjust the timeout for desired loading speed
      }
    };

    loadTiles(0); // Start loading tiles

    return () => {
      setTiles([]); // Clean up on component unmount
    };
  }, [tx, ty]); // Dependency array to reset when the coordinates change

  return (
    <group visible={visible}>
      {tiles}
    </group>
  );
}

export default Terrain
