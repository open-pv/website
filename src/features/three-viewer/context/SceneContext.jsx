// @ts-check
import { createContext } from 'react'

/**
 * @typedef {Object} SceneContextValue
 * @property {import('@/types/building').Building[]}              buildings
 * @property {import('@/types/simulation').SimulationResult|null} simulationResult
 * @property {function(string): void}                             setFrontendState
 * @property {import('@/types/pvSystem').PVPoint[]}               pvPoints
 * @property {function}                                           setPVPoints
 * @property {import('@/types/pvSystem').PVSystem[]}              pvSystems
 * @property {function}                                           setPVSystems
 * @property {boolean}                                            showTerrain
 * @property {function(boolean): void}                            setShowTerrain
 * @property {number|null}                                        slope
 * @property {function(number|null): void}                        setSlope
 * @property {number|null}                                        azimuth
 * @property {function(number|null): void}                        setAzimuth
 * @property {number|null}                                        yieldPerKWP
 * @property {function(number|null): void}                        setYieldPerKWP
 * @property {boolean}                                            isOpenSavingCalculation
 * @property {function(boolean): void}                            setIsOpenSavingCalculation
 * @property {import('@/types/pvSystem').PVSystem|null}           selectedPVSystem
 * @property {function}                                           setSelectedPVSystem
 */

/** @type {import('react').Context<SceneContextValue|null>} */
export const SceneContext = createContext(null)
