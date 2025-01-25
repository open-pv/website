import * as geotiff from 'geotiff'
import { mercator2meters } from './download'
import { coordinatesWebMercator } from './location'

/**
 * Abstract base class for both COG and XYZ based elevation models
 */
class DEM {
  origin = [0, 0]
  pixelScale = [1, 1]

  async toPoint3D(x, y) {
    const xyscale = mercator2meters()
    const [cx, cy] = coordinatesWebMercator

    const px = (x - this.origin[0]) / this.pixelScale[0]
    const py = (y - this.origin[1]) / -this.pixelScale[1]

    const fx = Math.floor(px)
    const fy = Math.floor(py)
    const tl = await this.requestPixel(fx, fy)
    const tr = await this.requestPixel(fx + 1, fy)
    const bl = await this.requestPixel(fx, fy + 1)
    const br = await this.requestPixel(fx + 1, fy + 1)

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
    dx /= xyscale * this.pixelScale[0]
    dy /= xyscale * -this.pixelScale[1]
    const len = Math.sqrt(dx * dx + dy * dy + 1.0)

    return {
      point: [xyscale * (x - cx), xyscale * (y - cy), z],
      normal: [dx / len, dy / len, -1.0 / len],
    }
  }
}

/**
 * Loads elevation data from a cloud-optimized geotiff terrain model.
 * Cache COG chunks, so that subsequent requests to the geotiff are faster.
 * Assumes the COG has 256x256 chunk size (which is true for virtually all COGs)
 */
class COGDEM extends DEM {
  tiff = null
  image = null
  width = -1
  height = -1
  boundingBox = [0, 0, 0, 0]
  cache = {}
  requestedRegions = {}

  static async init(url) {
    let me = new COGDEM()
    me.tiff = await geotiff.fromUrl(url)
    me.image = await me.tiff.getImage()
    me.pixelScale = me.image.fileDirectory.ModelPixelScale
    const tiepoint = me.image.fileDirectory.ModelTiepoint
    me.origin = [tiepoint[3], tiepoint[4]]
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

class LazyCOGDEM {
  static promises = {}

  constructor(url) {
    if (!LazyCOGDEM.promises[url]) {
      LazyCOGDEM.promises[url] = COGDEM.init(url)
    }
    this.promise = LazyCOGDEM.promises[url]
  }

  async toPoint3D(x, y) {
    const instance = await this.promise
    return instance.toPoint3D(x, y)
  }
}

export const SONNY_DEM = new LazyCOGDEM(
  'https://maps.heidler.info/sonny_dtm_20.tif',
)
