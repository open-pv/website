// @ts-check
import * as THREE from 'three'
import {
  calculateCenterFromGeometry,
  calculateInstalledKWp,
  calculateYieldPerKWP,
  generatePVSystemId,
} from '@/features/three-viewer/utils/pvSystemUtils'
/** @typedef {import('@/types/pvSystem').PVPoint} PVPoint */
/** @typedef {import('@/types/pvSystem').PVSystem} PVSystem */
import {
  triangulate,
  subdivideTriangle,
  calculatePolygonArea,
} from './geometryProcessing'
import {
  filterPolygonsByDistance,
  findClosestPolygon,
  projectOntoTriangle,
  getColorAtPointOnTriangle,
  getIntensityAtPointOnTriangle,
  calculatePolygonIntensity,
} from './yieldCalculations'

/**
 * Creates PV system data from user-drawn points.
 *
 * @param {Object}               params
 * @param {PVPoint[]}            params.pvPoints       - points the user clicked
 * @param {import('three').Mesh} params.simulationMesh - the scene-level simulation mesh
 * @returns {PVSystem|null}
 */
export function createPVSystemData({ pvPoints, simulationMesh }) {
  const points = pvPoints.map((obj) => obj.point)

  // Validation: need at least 3 points to create a polygon
  if (pvPoints.length < 3) {
    return null
  }

  // Step 1: Triangulate the user-drawn polygon
  const geometry = new THREE.BufferGeometry()
  const trianglesWithNormals = triangulate(pvPoints)
  const triangles = []
  const bufferTriangles = []
  const normalOffset = 0.1 // Offset to prevent z-fighting with building surfaces

  // Step 2: Apply normal offset for visual clarity and prepare triangles
  for (const { a, b, c } of trianglesWithNormals) {
    const shift = (element) => ({
      x: element.point.x + element.normal.x * normalOffset,
      y: element.point.y + element.normal.y * normalOffset,
      z: element.point.z + element.normal.z * normalOffset,
    })

    const sa = shift(a)
    const sb = shift(b)
    const sc = shift(c)

    triangles.push({ a: a.point, b: b.point, c: c.point })
    bufferTriangles.push(sa.x, sa.y, sa.z, sb.x, sb.y, sb.z, sc.x, sc.y, sc.z)
  }

  // Create Three.js geometry for rendering
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(bufferTriangles, 3),
  )
  geometry.name = 'pvSystem'

  // Step 3: Subdivide large triangles for higher resolution intensity sampling
  let subdividedTriangles = []
  const triangleSubdivisionThreshold = 0.8 // m²
  triangles.forEach((triangle) => {
    subdividedTriangles = subdividedTriangles.concat(
      subdivideTriangle(triangle, triangleSubdivisionThreshold),
    )
  })

  // Step 4: Extract the simulation geometry from the single scene-level mesh
  const simulationGeometry = simulationMesh.geometry.clone()
  simulationGeometry.applyMatrix4(simulationMesh.matrixWorld)

  // Step 5: Pre-filter building polygons by distance to PV points
  const polygonPrefilteringCutoff = 10 // meters
  const prefilteredPolygons = filterPolygonsByDistance(
    simulationGeometry,
    points,
    polygonPrefilteringCutoff,
  )

  // Step 6: For each vertex, find closest building polygon and extract intensity
  const newVertices = []
  const newColors = []
  const newIntensities = []

  subdividedTriangles.forEach((triangle) => {
    newVertices.push(triangle.a.x, triangle.a.y, triangle.a.z)
    newVertices.push(triangle.b.x, triangle.b.y, triangle.b.z)
    newVertices.push(triangle.c.x, triangle.c.y, triangle.c.z)
  })

  for (let i = 0; i < newVertices.length; i += 3) {
    const vertex = new THREE.Vector3(
      newVertices[i],
      newVertices[i + 1],
      newVertices[i + 2],
    )
    const closestPolygon = findClosestPolygon(
      vertex,
      prefilteredPolygons,
      polygonPrefilteringCutoff,
    )

    if (closestPolygon) {
      // Project vertex onto building surface and interpolate intensity
      const projectedVertex = projectOntoTriangle(vertex, closestPolygon)
      const color = getColorAtPointOnTriangle(projectedVertex, closestPolygon)
      const intensity = getIntensityAtPointOnTriangle(
        projectedVertex,
        closestPolygon,
      )
      newColors.push(color.r, color.g, color.b)
      newIntensities.push(intensity)
    } else {
      // No building found nearby - use default values
      newColors.push(1, 1, 1)
      newIntensities.push(-1)
    }
  }

  // Step 7: Calculate area-weighted average intensity and total yield
  const polygonArea = calculatePolygonArea(triangles)
  const polygonIntensity = calculatePolygonIntensity(
    newVertices,
    newIntensities,
  )
  const annualYield = polygonArea * polygonIntensity

  // Step 8: Calculate pre-computed properties
  const center = calculateCenterFromGeometry(geometry)
  const yieldPerKWPPerYear = calculateYieldPerKWP(polygonIntensity)
  const installedKWp = calculateInstalledKWp(polygonArea)

  // Step 9: Return complete PV system object
  return {
    id: generatePVSystemId(),
    points: [...pvPoints],
    geometry: geometry,
    center: center,
    totalArea: polygonArea,
    yieldPerArea: polygonIntensity,
    annualYield: annualYield,
    yieldPerKWPPerYear: yieldPerKWPPerYear,
    installedKWp: installedKWp,
  }
}
