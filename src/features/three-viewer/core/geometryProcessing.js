import * as THREE from 'three'

/**
 * Recursively subdivides a triangle into smaller triangles if its area exceeds a threshold.
 * Uses midpoint subdivision to create 4 smaller triangles.
 *
 * @param {Object} triangle - Triangle with vertices {a, b, c}
 * @param {number} threshold - Maximum area threshold for subdivision (in m²)
 * @returns {Array} Array of subdivided triangles
 */
export function subdivideTriangle(triangle, threshold) {
  const distance = (p1, p2) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2)

  const midPoint = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
  })

  const aToB = distance(triangle.a, triangle.b)
  const bToC = distance(triangle.b, triangle.c)
  const cToA = distance(triangle.c, triangle.a)

  const area = calculateTriangleArea(triangle)

  if (area < threshold) {
    return [triangle]
  }

  const abMid = midPoint(triangle.a, triangle.b)
  const bcMid = midPoint(triangle.b, triangle.c)
  const caMid = midPoint(triangle.c, triangle.a)

  return subdivideTriangle({ a: triangle.a, b: abMid, c: caMid }, threshold)
    .concat(subdivideTriangle({ a: abMid, b: triangle.b, c: bcMid }, threshold))
    .concat(subdivideTriangle({ a: caMid, b: bcMid, c: triangle.c }, threshold))
    .concat(subdivideTriangle({ a: abMid, b: bcMid, c: caMid }, threshold))
}

/**
 * Calculates the total area of a polygon from its triangulation.
 *
 * @param {Array} polygon - Array of triangles that make up the polygon
 * @returns {number} Total area in m²
 */
export function calculatePolygonArea(polygon) {
  let totalArea = 0

  polygon.forEach((triangle) => {
    totalArea += calculateTriangleArea(triangle)
  })

  return totalArea
}

/**
 * Calculates the area of a triangle using the cross product method.
 *
 * @param {Object} triangle - Triangle with vertices {a, b, c}
 * @returns {number} Area in m²
 */
export function calculateTriangleArea(triangle) {
  const { a, b, c } = triangle

  const ab = new THREE.Vector3().subVectors(b, a)
  const ac = new THREE.Vector3().subVectors(c, a)
  const crossProduct = new THREE.Vector3().crossVectors(ab, ac)
  const area = 0.5 * crossProduct.length()

  return area
}

/**
 * Triangulates a polygon in 3D space using ear clipping algorithm.
 * Handles polygons with 3 or more vertices.
 *
 * @param {Array} points - Array of points with {point, normal} structure
 * @returns {Array} Array of triangles with structure {a, b, c}
 */
export function triangulate(points) {
  if (points.length == 3) {
    return [{ a: points[0], b: points[1], c: points[2] }]
  } else if (points.length < 3) {
    return []
  }

  // As the triangle is in 3d-space anyways, we can just assume that vertices are given in CCW order
  const pt = (i) => points[(i + points.length) % points.length]

  const ab = sub(pt(1).point, pt(0).point)
  const ac = sub(pt(2).point, pt(0).point)
  const normal = new THREE.Vector3().crossVectors(ab, ac)

  let countNegative = 0
  let countPositive = 0

  // Taking inspiration from a polygon triangulation based on the two ears theorem
  // However, in R3, things can get a bit more wonky...
  // https://en.wikipedia.org/wiki/Two_ears_theorem#Relation_to_triangulations
  const makeTriplet = (left, vertex, right) => {
    const det = determinant(
      sub(vertex.point, left.point),
      sub(vertex.point, right.point),
      normal,
    )

    if (det > 0) {
      countPositive += 1
    } else {
      countNegative += 1
    }

    return { left: left, vertex: vertex, right: right, det }
  }

  const triplets = points.map((cur, i) =>
    makeTriplet(pt(i - 1), cur, pt(i + 1)),
  )

  if (countPositive < countNegative) {
    // negative det => convex vertex, so we flip all determinants
    for (let t of triplets) {
      t.det = -t.det
    }
  }

  const concaveVertices = triplets.filter((t) => t.det < 0).map((t) => t.vertex)

  let anyEar = false
  for (let t of triplets) {
    // Idea: Define the 3d analogue of a polygon ear by looking at triples and projecting the
    // remaining points onto the plane spanned by that particular triangle
    // An ear is any triangle having no concave vertices lying inside it
    const containedConcaveVertices = concaveVertices
      .filter((v) => v != t.left && v != t.vertex && v != t.right)
      .filter((v) =>
        pointInsideTriangle(
          v.point,
          t.left.point,
          t.vertex.point,
          t.right.point,
        ),
      )

    t.isEar = t.det > 0 && containedConcaveVertices.length == 0
    if (t.isEar) {
      anyEar = true
    }
  }

  // Prevent infinite loop
  if (!anyEar) {
    console.warn('No ear found in ear clipping!')
    triplets[0].isEar = true
  }

  for (let ear of triplets.filter((t) => t.isEar)) {
    const remainingPoints = triplets
      .filter((t) => t != ear)
      .map((t) => t.vertex)
    return [{ a: ear.left, b: ear.vertex, c: ear.right }].concat(
      triangulate(remainingPoints),
    )
  }
}

/**
 * Calculates the determinant of a 3x3 matrix formed by three vectors.
 *
 * @param {THREE.Vector3} v1 - First column vector
 * @param {THREE.Vector3} v2 - Second column vector
 * @param {THREE.Vector3} v3 - Third column vector
 * @returns {number} Determinant value
 */
export function determinant(v1, v2, v3) {
  const matrix = new THREE.Matrix3()
  matrix.set(
    v1.x,
    v2.x,
    v3.x, // First column
    v1.y,
    v2.y,
    v3.y, // Second column
    v1.z,
    v2.z,
    v3.z, // Third column
  )
  return matrix.determinant()
}

/**
 * Subtracts two vectors (v1 - v2).
 *
 * @param {THREE.Vector3} v1 - First vector
 * @param {THREE.Vector3} v2 - Second vector
 * @returns {THREE.Vector3} Result vector
 */
export function sub(v1, v2) {
  return new THREE.Vector3().subVectors(v1, v2)
}

/**
 * Calculates the cross product of two vectors.
 *
 * @param {THREE.Vector3} v1 - First vector
 * @param {THREE.Vector3} v2 - Second vector
 * @returns {THREE.Vector3} Cross product vector
 */
export function cross(v1, v2) {
  return new THREE.Vector3().crossVectors(v1, v2)
}

/**
 * Tests if a point lies inside a triangle in 3D space.
 *
 * @param {THREE.Vector3} point - Point to test
 * @param {THREE.Vector3} v1 - First triangle vertex
 * @param {THREE.Vector3} v2 - Second triangle vertex
 * @param {THREE.Vector3} v3 - Third triangle vertex
 * @returns {boolean} True if point is inside triangle
 */
export function pointInsideTriangle(point, v1, v2, v3) {
  const normal = cross(sub(v1, v2), sub(v2, v3))
  const n1 = cross(normal, sub(v1, v2))
  const n2 = cross(normal, sub(v2, v3))
  const n3 = cross(normal, sub(v3, v1))

  const d1 = Math.sign(n1.dot(sub(v1, point)))
  const d2 = Math.sign(n2.dot(sub(v2, point)))
  const d3 = Math.sign(n3.dot(sub(v3, point)))

  // Inside if all 3 have the same sign
  return d1 == d2 && d2 == d3
}
