// @ts-check
export {}

/**
 * The colored mesh produced by ShadingScene.calculate(). Its geometry carries
 * these vertex attributes (documented contract, relied on by yieldCalculations
 * and CustomMapControl):
 *   - position    Float32, 3/vertex
 *   - normal      Float32, 3/vertex
 *   - color       Float32, 3/vertex  (RGB from the colormap)
 *   - intensities Float32, 1/face    (kWh/m²/year)
 * @typedef {import('three').Mesh} SimulationMesh
 */

/**
 * The single, scene-level result of running the solar simulation.
 * There is exactly ONE of these per completed simulation run — it is NOT per building.
 * @typedef {Object} SimulationResult
 * @property {SimulationMesh}          mesh   - colored mesh covering all simulation geometry
 * @property {import('three').Vector3} center - bounding-box center, used for camera positioning
 */
