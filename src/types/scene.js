// @ts-check
export {}

/**
 * The complete result of the simulation pipeline. mainSimulation() returns this
 * instead of pushing values onto window.*.
 * @typedef {Object} SimulationOutput
 * @property {import('./building').Building[]}              buildings
 * @property {import('./simulation').SimulationResult|null} simulationResult
 * @property {import('./vegetation').VegetationGeometries}  vegetation
 * @property {string|false}                                 federalState
 */
