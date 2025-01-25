import * as geotiff from 'geotiff'
import { mercator2meters } from './download'
import { coordinatesWebMercator } from './location'

/**
 * Abstract base class for both COG and XYZ based elevation models
 */
class DEM {
  origin = [0, 0]
  pixelScale = [1, 1]
  point_cache = {}

  async toPoint3D(x, y) {
    const key = (x, y)
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

  async getGridPoints(minX, minY, maxX, maxY) {
    const xyscale = mercator2meters()
    const [cx, cy] = coordinatesWebMercator
    const x0 = Math.floor((minX - this.origin[0]) / this.pixelScale[0])
    const x1 = Math.ceil((maxX - this.origin[0]) / this.pixelScale[0])
    const y1 = Math.ceil((minY - this.origin[1]) / -this.pixelScale[1])
    const y0 = Math.floor((maxY - this.origin[1]) / -this.pixelScale[1])

    const grid = Array(y1 - y0)
      .fill(0)
      .map(() => new Array(x1 - x0))

    for (let y = y0; y < y1; y++) {
      let z_x_prev = await this.requestPixel(x0 - 1, y)
      let z = await this.requestPixel(x0, y)
      for (let x = x0; x < x1; x++) {
        let z_x_next = await this.requestPixel(x + 1, y)
        const z_y_prev = await this.requestPixel(x, y - 1)
        const z_y_next = await this.requestPixel(x, y + 1)

        const dx = (z_x_next - z_x_prev) / (2 * xyscale * this.pixelScale[0])
        const dy = (z_y_next - z_y_prev) / (2 * xyscale * -this.pixelScale[1])
        const len = Math.sqrt(dx * dx + dy * dy + 1.0)

        const x_merc = x * this.pixelScale[0] + this.origin[0]
        const y_merc = y * -this.pixelScale[1] + this.origin[1]
        grid[y - y0][x - x0] = {
          point: [xyscale * (x_merc - cx), xyscale * (y_merc - cy), z],
          normal: [dx / len, dy / len, -1.0 / len],
        }

        z_x_prev = z
        z = z_x_next
      }
    }
    return grid
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

/**
 * Loads elevation data from a Mapbox Terrain-RGB encoded elevation model.
 * Caches indivisual chunks, so that subsequent requests are faster.
 * Assumes the tilesize to be 256x256
 */
class XYZDEM extends DEM {
  zoom_level = -1
  url = null
  width = -1
  height = -1
  cache = {}
  requestedRegions = {}

  static async init(url, zoom_level) {
    let me = new XYZDEM()
    me.url = url
    me.zoom_level = zoom_level
    const scl = 40075016.68 / (256 << me.zoom_level)
    me.origin = [-20037508.34, 20037508.34]
    me.pixelScale = [scl, scl]
    return me
  }

  async loadTile(tile_x, tile_y) {
    const heights = Array(256 * 256)

    const url = this.url
      .replace('{z}', this.zoom_level)
      .replace('{x}', tile_x)
      .replace('{y}', tile_y)
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = url

    let success = await new Promise((resolve, reject) => {
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
    })

    if (!success) {
      console.error(`Error loading DEM tile from ${url}`)
      heights.fill(0)
      return heights
    }

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // Get decoded image pixel data
    const raw_data = ctx.getImageData(0, 0, img.width, img.height)
    for (let i = 0; i < 256 * 256; i++) {
      const r = raw_data.data[i * 4]
      const g = raw_data.data[i * 4 + 1]
      const b = raw_data.data[i * 4 + 2]
      // cf. https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-rgb-v1/#elevation-data
      heights[i] = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1
    }
    return heights
  }

  /*
   * Get pixel data for (px, py) from the (hypothetical) global mosaic at the given zoom level,
   * i.e. for (px, py) == (0, 0), returns elevation data at lat=90, lon=-180
   */
  async requestPixel(px, py) {
    const tile_x = Math.floor(px / 256) // Tile x index
    const tile_y = Math.floor(py / 256) // Tile y index
    const tile_key = [tile_x, tile_y]
    if (!this.requestedRegions[tile_key]) {
      console.log(`cache miss: ${tile_key}`)
      // Only request each tile once
      this.requestedRegions[tile_key] = this.loadTile(tile_x, tile_y)
    } else {
      console.log('cache hit')
    }
    const region = await this.requestedRegions[tile_key]
    const height = region[px - 256 * tile_x + (py - 256 * tile_y) * 256]
    return height
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
    if (this.instance === null) {
      this.instance = await this.promise
    }
    return this.instance.toPoint3D(x, y)
  }

  async getGridPoints(minX, minY, maxX, maxY) {
    if (this.instance === null) {
      this.instance = await this.promise
    }
    return this.instance.toPoint3D(x, y)
  }
}

class LazyXYZDEM {
  static promises = {}

  constructor(url, zoom) {
    if (!LazyXYZDEM.promises[url]) {
      LazyXYZDEM.promises[(url, zoom)] = XYZDEM.init(url, zoom)
    }
    this.promise = LazyXYZDEM.promises[(url, zoom)]
    this.instance = null
  }

  async toPoint3D(x, y) {
    if (this.instance === null) {
      this.instance = await this.promise
    }
    return this.instance.toPoint3D(x, y)
  }

  async getGridPoints(minX, minY, maxX, maxY) {
    if (this.instance === null) {
      this.instance = await this.promise
    }
    return this.instance.getGridPoints(minX, minY, maxX, maxY)
  }
}

export const SONNY_DEM = new LazyXYZDEM(
  'https://vegetation.openpv.de/data/dem/sonny/{z}/{x}/{y}.webp',
  13,
)

export const VEGETATION_DEM = new LazyXYZDEM(
  'https://vegetation.openpv.de/data/vegetation/{z}/{x}/{y}.webp',
  17,
)
