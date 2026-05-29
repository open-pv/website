// @ts-check
export {}

/** @typedef {'simulation' | 'surrounding' | 'background'} BuildingType */

/**
 * A building is an INPUT to the simulation. It only ever holds identity,
 * a classification, and input geometry. It does NOT hold simulation output.
 * @typedef {Object} Building
 * @property {number}                         id
 * @property {BuildingType}                   type
 * @property {import('three').BufferGeometry} geometry
 */
