/**
 * Shared type definitions for simulatable objects in the scene.
 *
 * The core idea is that any scene object that can receive solar irradiance
 * (buildings today, standalone PV meshes in the future) implements the
 * SimulatableObject shape. After the simulation pipeline runs, the result
 * is stored in a `simulationResult` sub-object rather than being scattered
 * as top-level fields, making the "has been simulated" state explicit.
 */

/**
 * Result stored on a scene object once solar simulation has been run on it.
 *
 * @typedef {Object} SimulationResult
 * @property {import('three').Mesh}    mesh   - Mesh colored by solar yield (kWh/m²/year per vertex)
 * @property {import('three').Vector3} center - Bounding-box center of the simulation area, used for camera positioning
 */

/**
 * Any scene object that can participate in the solar simulation pipeline.
 * Buildings and future standalone PV meshes both implement this shape.
 *
 * @typedef {Object} SimulatableObject
 * @property {string|number}              id               - Unique identifier
 * @property {import('three').BufferGeometry} geometry     - Input geometry fed to the simulation engine
 * @property {SimulationResult}           [simulationResult] - Set after simulation; absent on non-simulated objects
 */

/**
 * @typedef {Object} _BuildingBase
 * @property {number}                         id
 * @property {import('three').BufferGeometry} geometry
 */

/**
 * A building that does not receive full solar simulation.
 * 'surrounding' buildings are used only for shadow/shading geometry.
 * 'background' buildings are rendered for visual context only.
 *
 * @typedef {_BuildingBase & { type: 'surrounding' | 'background' }} BackgroundBuilding
 */

/**
 * A building that has been fully simulated.
 * `simulationResult` is always present on this variant.
 *
 * @typedef {_BuildingBase & SimulatableObject & { type: 'simulation', simulationResult: SimulationResult }} SimulatedBuilding
 */

/**
 * Discriminated union covering all building variants.
 * Narrow with `building.type === 'simulation'` to access `simulationResult`.
 *
 * @typedef {BackgroundBuilding | SimulatedBuilding} Building
 */

/**
 * A PV system drawn by the user on a simulation building surface.
 *
 * @typedef {Object} PVSystem
 * @property {string}                         id
 * @property {Array<{point: import('three').Vector3, normal: import('three').Vector3}>} points
 * @property {import('three').BufferGeometry} geometry
 * @property {{x: number, y: number, z: number}} center
 * @property {number} totalArea         - m²
 * @property {number} yieldPerArea      - kWh/m²/year
 * @property {number} annualYield       - kWh/year
 * @property {number} yieldPerKWPPerYear - kWh/kWp/year
 * @property {number} installedKWp
 */
