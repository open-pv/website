import * as THREE from 'three'
import { calculateTriangleArea } from './geometryProcessing'

/**
 * Finds the closest building polygon to a given vertex.
 *
 * @param {THREE.Vector3} vertex - The vertex to find the closest polygon for
 * @param {Array} polygons - Array of polygon objects with vertices property
 * @param {number} polygonPrefilteringCutoff - Distance threshold for warnings
 * @returns {Object|null} Closest polygon object or null
 */
export function findClosestPolygon(
  vertex,
  polygons,
  polygonPrefilteringCutoff,
) {
  let closestPolygon = null
  let minDistance = Infinity

  polygons.forEach((polygon) => {
    const [v0, v1, v2] = polygon.vertices
    const distance =
      vertex.distanceTo(v0) + vertex.distanceTo(v1) + vertex.distanceTo(v2)
    if (distance < minDistance) {
      minDistance = distance
      closestPolygon = polygon
    }
  })

  if (minDistance >= polygonPrefilteringCutoff) {
    console.error(
      `Error: Trying to create a polygon with a distance longer than the threshold (${minDistance})`,
    )
  }

  return closestPolygon
}

/**
 * Filters building polygons by distance to PV system points.
 * Only returns polygons within the threshold distance.
 *
 * @param {THREE.BufferGeometry} geometry - Building mesh geometry
 * @param {Array} points - Array of PV system points
 * @param {number} threshold - Maximum distance threshold
 * @returns {Array} Filtered array of polygon objects with vertices, colors, normal, and intensities
 */
export function filterPolygonsByDistance(geometry, points, threshold) {
  const filteredPolygons = []

  if (!geometry.isBufferGeometry) return

  const positions = geometry.attributes.position.array
  const colors = geometry.attributes.color
    ? geometry.attributes.color.array
    : null
  const intensities = geometry.attributes.intensities
    ? geometry.attributes.intensities.array
    : null

  for (let i = 0; i < positions.length; i += 9) {
    const v0 = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2],
    )
    const v1 = new THREE.Vector3(
      positions[i + 3],
      positions[i + 4],
      positions[i + 5],
    )
    const v2 = new THREE.Vector3(
      positions[i + 6],
      positions[i + 7],
      positions[i + 8],
    )

    const color0 = colors
      ? new THREE.Color(colors[i], colors[i + 1], colors[i + 2])
      : new THREE.Color(1, 1, 1)
    const color1 = colors
      ? new THREE.Color(colors[i + 3], colors[i + 4], colors[i + 5])
      : new THREE.Color(1, 1, 1)
    const color2 = colors
      ? new THREE.Color(colors[i + 6], colors[i + 7], colors[i + 8])
      : new THREE.Color(1, 1, 1)

    const intensity1 = intensities ? intensities[i / 9] : -1000
    const intensity2 = intensities ? intensities[i / 9] : -1000
    const intensity3 = intensities ? intensities[i / 9] : -1000

    let minDistance = Infinity
    points.forEach((point) => {
      const distance = Math.min(
        point.distanceTo(v0),
        point.distanceTo(v1),
        point.distanceTo(v2),
      )
      if (distance < minDistance) {
        minDistance = distance
      }
    })

    if (minDistance < threshold) {
      const normal = new THREE.Triangle(v0, v1, v2).getNormal(
        new THREE.Vector3(),
      )
      filteredPolygons.push({
        vertices: [v0, v1, v2],
        colors: [color0, color1, color2],
        normal,
        intensities: [intensity1, intensity2, intensity3],
      })
    }
  }

  return filteredPolygons
}

/**
 * Projects a vertex orthogonally onto a triangle's plane.
 *
 * @param {THREE.Vector3} vertex - Vertex to project
 * @param {Object} triangle - Triangle object with vertices and normal
 * @returns {THREE.Vector3} Projected point on triangle's plane
 */
export function projectOntoTriangle(vertex, triangle) {
  const [v0, v1, v2] = triangle.vertices
  const normal = triangle.normal.clone().normalize()

  const d = v0.dot(normal)
  const t = (d - vertex.dot(normal)) / normal.dot(normal)
  const projection = vertex.clone().add(normal.clone().multiplyScalar(t))

  return projection
}

/**
 * Gets the interpolated color at a point on a triangle using barycentric coordinates.
 *
 * @param {THREE.Vector3} point - Point on the triangle
 * @param {Object} triangle - Triangle object with vertices, colors, and normal
 * @returns {THREE.Color} Interpolated color at the point
 */
export function getColorAtPointOnTriangle(point, triangle) {
  const [v0, v1, v2] = triangle.vertices
  const normal = triangle.normal.clone().normalize()

  const areaABC = normal.dot(
    new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)),
  )
  const areaPBC = normal.dot(
    new THREE.Vector3().crossVectors(
      v1.clone().sub(point),
      v2.clone().sub(point),
    ),
  )
  const areaPCA = normal.dot(
    new THREE.Vector3().crossVectors(
      v2.clone().sub(point),
      v0.clone().sub(point),
    ),
  )

  const u = areaPBC / areaABC
  const v = areaPCA / areaABC
  const w = 1 - u - v

  const color0 = triangle.colors[0]
  const color1 = triangle.colors[1]
  const color2 = triangle.colors[2]

  const r = u * color0.r + v * color1.r + w * color2.r
  const g = u * color0.g + v * color1.g + w * color2.g
  const b = u * color0.b + v * color1.b + w * color2.b

  return new THREE.Color(r, g, b)
}

/**
 * Gets the interpolated solar intensity at a point on a triangle using barycentric coordinates.
 *
 * @param {THREE.Vector3} point - Point on the triangle
 * @param {Object} triangle - Triangle object with vertices, intensities, and normal
 * @returns {number} Interpolated intensity at the point (kWh/m²/year)
 */
export function getIntensityAtPointOnTriangle(point, triangle) {
  const [v0, v1, v2] = triangle.vertices
  const normal = triangle.normal.clone().normalize()

  const areaABC = normal.dot(
    new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)),
  )
  const areaPBC = normal.dot(
    new THREE.Vector3().crossVectors(
      v1.clone().sub(point),
      v2.clone().sub(point),
    ),
  )
  const areaPCA = normal.dot(
    new THREE.Vector3().crossVectors(
      v2.clone().sub(point),
      v0.clone().sub(point),
    ),
  )

  const u = areaPBC / areaABC
  const v = areaPCA / areaABC
  const w = 1 - u - v

  const intensity0 = triangle.intensities[0]
  const intensity1 = triangle.intensities[1]
  const intensity2 = triangle.intensities[2]

  const intensityAtPoint = u * intensity0 + v * intensity1 + w * intensity2

  return intensityAtPoint
}

/**
 * Calculates the area-weighted average intensity for a polygon.
 *
 * @param {Array} vertices - Flat array of vertex coordinates [x1, y1, z1, x2, ...]
 * @param {Array} intensities - Array of intensity values for each vertex
 * @returns {number} Average intensity weighted by triangle area (kWh/m²/year)
 */
export function calculatePolygonIntensity(vertices, intensities) {
  const numTriangles = vertices.length / 9
  let totalIntensity = 0
  let totalArea = 0

  for (let i = 0; i < numTriangles; i++) {
    const triangle = {
      a: new THREE.Vector3(
        vertices[i * 9],
        vertices[i * 9 + 1],
        vertices[i * 9 + 2],
      ),
      b: new THREE.Vector3(
        vertices[i * 9 + 3],
        vertices[i * 9 + 4],
        vertices[i * 9 + 5],
      ),
      c: new THREE.Vector3(
        vertices[i * 9 + 6],
        vertices[i * 9 + 7],
        vertices[i * 9 + 8],
      ),
      intensities: [
        intensities[i * 3],
        intensities[i * 3 + 1],
        intensities[i * 3 + 2],
      ],
    }

    const triangleArea = calculateTriangleArea(triangle)
    const triangleIntensity = calculateTriangleIntensity(triangle)
    totalIntensity += triangleIntensity * triangleArea
    totalArea += triangleArea
  }

  const averageIntensity = totalIntensity / totalArea
  return averageIntensity
}

/**
 * Calculates the average intensity for a triangle from its vertex intensities.
 *
 * @param {Object} triangle - Triangle object with intensities array
 * @returns {number} Average intensity (kWh/m²/year)
 */
export function calculateTriangleIntensity(triangle) {
  const intensities = triangle.intensities
  const averageIntensity =
    (intensities[0] + intensities[1] + intensities[2]) / 3
  return averageIntensity
}
