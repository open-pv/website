import * as THREE from 'three'

/**
 * Generates a unique ID for a PV system.
 * Format: "pv-{timestamp}-{random}"
 *
 * @returns {string} Unique identifier for the PV system
 *
 * @example
 * const id = generatePVSystemId()
 * // Returns: "pv-1703001234567-k8n2p9x4q"
 */
export function generatePVSystemId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  return `pv-${timestamp}-${random}`
}

/**
 * Calculates the geometric center from a THREE.BufferGeometry.
 * Averages all vertex positions from the geometry's position attribute.
 *
 * @param {THREE.BufferGeometry} geometry - The geometry to calculate center from
 * @returns {{x: number, y: number, z: number}} The geometric center point
 *
 * @example
 * const center = calculateCenterFromGeometry(geometry)
 * // Returns: {x: 10.5, y: 20.3, z: 5.7}
 */
export function calculateCenterFromGeometry(geometry) {
  const points = geometry.attributes.position.array
  const length = points.length / 3
  const sum = points.reduce(
    (acc, value, index) => {
      acc[index % 3] += value
      return acc
    },
    [0, 0, 0],
  )
  return {
    x: sum[0] / length,
    y: sum[1] / length,
    z: sum[2] / length,
  }
}

/**
 * Calculates the slope (tilt angle) from a normal vector.
 * Slope is the angle between the normal and the vertical (up) direction.
 *
 * @param {THREE.Vector3} normal - The surface normal vector
 * @returns {number} Slope in degrees from horizontal (0° = horizontal, 90° = vertical)
 *
 * @example
 * const normal = new THREE.Vector3(0, 0, 1)
 * const slope = calculateSlopeFromNormal(normal)
 * // Returns: 0 (horizontal surface)
 *
 * @example
 * const normal = new THREE.Vector3(0, 1, 0)
 * const slope = calculateSlopeFromNormal(normal)
 * // Returns: 90 (vertical surface)
 */
export function calculateSlopeFromNormal(normal) {
  const up = new THREE.Vector3(0, 0, 1)
  const angleRad = normal.angleTo(up)
  return THREE.MathUtils.radToDeg(angleRad)
}

/**
 * Calculates the azimuth (compass direction) from a normal vector.
 * Azimuth is measured clockwise from North (positive Y-axis).
 *
 * @param {THREE.Vector3} normal - The surface normal vector
 * @returns {number} Azimuth in degrees (0° = North, 90° = East, 180° = South, 270° = West)
 *
 * @example
 * const normal = new THREE.Vector3(0, 1, 0)
 * const azimuth = calculateAzimuthFromNormal(normal)
 * // Returns: 0 (facing North)
 *
 * @example
 * const normal = new THREE.Vector3(1, 0, 0)
 * const azimuth = calculateAzimuthFromNormal(normal)
 * // Returns: 90 (facing East)
 */
export function calculateAzimuthFromNormal(normal) {
  const azimuthRad = Math.atan2(normal.x, normal.y)
  let azimuth = THREE.MathUtils.radToDeg(azimuthRad)
  if (azimuth < 0) {
    azimuth += 360
  }
  return azimuth
}

/**
 * Calculates the yield per kilowatt-peak (kWp) from yield per area.
 * Uses a conversion factor of 5.5 to convert from kWh/m²/year to kWh/kWp/year.
 *
 * @param {number} yieldPerArea - Solar yield per area in kWh/m²/year
 * @returns {number} Yield per kWp in kWh/kWp/year
 *
 * @example
 * const yieldPerArea = 1000  // kWh/m²/year
 * const yieldPerKWP = calculateYieldPerKWP(yieldPerArea)
 * // Returns: 5500 (kWh/kWp/year)
 */
export function calculateYieldPerKWP(yieldPerArea) {
  return yieldPerArea * 5.5
}
