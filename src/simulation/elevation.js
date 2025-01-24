import * as geotiff from 'geotiff'
import { mercator2meters } from './download'
import { coordinatesWebMercator } from './location'

/**
 * Loads the tiles from geotiff terrain model to cache, so that requests to the geotiff are faster.
 */
export class ElevationManager {
  static instancePromise = null
  static state = 'uninitialized'

  tiff = null
  image = null
  width = -1
  height = -1
  boundingBox = [0, 0, 0, 0]
  cache = {}
  requestedRegions = {}

  static async toPoint3D(x, y) {
    const me = await this.getInstance()
    const xyscale = mercator2meters()
    const [cx, cy] = coordinatesWebMercator

    const px = (x - me.tiepoint[3]) / me.pixelScale[0]
    const py = (y - me.tiepoint[4]) / -me.pixelScale[1]

    const fx = Math.floor(px)
    const fy = Math.floor(py)
    const tl = await me.requestPixel(fx, fy)
    const tr = await me.requestPixel(fx + 1, fy)
    const bl = await me.requestPixel(fx, fy + 1)
    const br = await me.requestPixel(fx + 1, fy + 1)

    // bilinear interpolation
    const tx = px % 1
    const ty = py % 1
    const qx = 1 - tx
    const qy = 1 - ty
    const z =
      qx * qy * tl + // Top left
      tx * qy * tr + // Top right
      qx * ty * bl + // Bottom left
      tx * ty * br // Botrom right

    // Calculate normal
    let dx =
      -qy * tl + // Top left
      qy * tr + // Top right
      -ty * bl + // Bottom left
      ty * tr // Botrom right
    let dy =
      -qx * tl + // Top left
      -tx * tr + // Top right
      qx * bl + // Bottom left
      tx * br // Botrom right
    dx /= xyscale * me.pixelScale[0]
    dy /= xyscale * -me.pixelScale[1]
    const len = Math.sqrt(dx * dx + dy * dy + 1.0)

    return {
      point: [xyscale * (x - cx), xyscale * (y - cy), z],
      normal: [dx / len, dy / len, -1.0 / len],
    }
  }

  static async getInstance() {
    if (!this.instancePromise) {
      this.instancePromise = this.init()
    }
    return this.instancePromise
  }

  static async init() {
    this.instance = new ElevationManager()
    let me = this.instance
    me.tiff = await geotiff.fromUrl(
      'https://maps.heidler.info/sonny_dtm_20.tif',
    )
    me.image = await this.instance.tiff.getImage()
    me.pixelScale = me.image.fileDirectory.ModelPixelScale
    me.tiepoint = me.image.fileDirectory.ModelTiepoint
    return me
  }

  async requestPixel(px, py) {
    const tile_x = Math.floor(px / 256) * 256 // Internal COG tile window start
    const tile_y = Math.floor(py / 256) * 256 // Internal COG tile window start
    const tile_key = [tile_x, tile_y]
    if (!this.requestedRegions[tile_key]) {
      // Only request each tile once
      this.requestedRegions[tile_key] = this.image.readRasters({
        window: [tile_x, tile_y, tile_x + 256, tile_y + 256],
        interleave: true,
      })
    }
    const region = await this.requestedRegions[tile_key]
    return region[px - tile_x + (py - tile_y) * 256]
  }
}
