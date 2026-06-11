// @ts-check
export {}

/**
 * @typedef {Object} PVPoint
 * @property {import('three').Vector3} point
 * @property {import('three').Vector3} normal
 */

/**
 * A PV system drawn by the user on a simulation surface.
 * @typedef {Object} PVSystem
 * @property {string}                         id
 * @property {PVPoint[]}                      points
 * @property {import('three').BufferGeometry} geometry
 * @property {import('three').Vector3}        center            - geometric center (was {x,y,z}; now a Vector3)
 * @property {number}                         totalArea         - m²
 * @property {number}                         yieldPerArea      - kWh/m²/year
 * @property {number}                         annualYield       - kWh/year
 * @property {number}                         yieldPerKWPPerYear - kWh/kWp/year
 * @property {number}                         installedKWp
 */
