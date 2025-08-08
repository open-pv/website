import { useContext, useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { SceneContext } from '../../context'
import TextSprite from '../TextSprite'

export const PVSystems = () => {
  const sceneContext = useContext(SceneContext)
  return (
    <>
      {sceneContext.pvSystems.map((geometry) => (
        <PVSystem geometry={geometry} />
      ))}
    </>
  )
}

export function createPVSystem({
  setPVSystems,
  setSelectedPVSystem,
  pvPoints,
  setPVPoints,
  simulationMeshes,
}) {
  const points = pvPoints.map((obj) => obj.point)
  if (pvPoints.length < 3) {
    return
  }
  const geometry = new THREE.BufferGeometry()
  const trianglesWithNormals = triangulate(pvPoints)
  const triangles = []
  const bufferTriangles = []
  const normalOffset = 0.1 // Adjust this value as needed

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

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(bufferTriangles, 3),
  )
  geometry.name = 'pvSystem'

  let subdividedTriangles = []
  const triangleSubdivisionThreshold = 0.8
  triangles.forEach((triangle) => {
    subdividedTriangles = subdividedTriangles.concat(
      subdivideTriangle(triangle, triangleSubdivisionThreshold),
    )
  })

  const geometries = []

  simulationMeshes.forEach((mesh) => {
    const geom = mesh.geometry.clone()
    geom.applyMatrix4(mesh.matrixWorld)
    geometries.push(geom)
  })
  const simulationGeometry = BufferGeometryUtils.mergeGeometries(
    geometries,
    true,
  )
  const polygonPrefilteringCutoff = 10
  const prefilteredPolygons = filterPolygonsByDistance(
    simulationGeometry,
    points,
    polygonPrefilteringCutoff,
  )
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
      const projectedVertex = projectOntoTriangle(vertex, closestPolygon)
      const color = getColorAtPointOnTriangle(projectedVertex, closestPolygon)
      const intensity = getIntensityAtPointOnTriangle(
        projectedVertex,
        closestPolygon,
      )
      newColors.push(color.r, color.g, color.b)
      newIntensities.push(intensity)
    } else {
      newColors.push(1, 1, 1)
      newIntensities.push(-1)
    }
  }
  const polygonArea = calculatePolygonArea(triangles)
  const polygonIntensity = calculatePolygonIntensity(
    newVertices,
    newIntensities,
  )
  const annualYield = polygonArea * polygonIntensity

  geometry.annualYield = annualYield
  geometry.area = polygonArea

  setPVSystems((prevSystems) => [...prevSystems, geometry])
  setPVPoints([])
  setSelectedPVSystem([geometry])
}

const PVSystem = ({ geometry }) => {
  const textRef = useRef()

  const center = calculateCenter(geometry.attributes.position.array)

  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <>
      <mesh
        geometry={geometry}
        material={
          new THREE.MeshStandardMaterial({
            color: '#2b2c40',
            transparent: true,
            opacity: 0.5,
            metalness: 1,
            side: THREE.DoubleSide,
          })
        }
      />

      <TextSprite
        text={`Jahresertrag: ${Math.round(geometry.annualYield).toLocaleString(
          'de',
        )} kWh pro Jahr\nFläche: ${geometry.area.toPrecision(3)}m²`}
        position={center}
      />
    </>
  )
}

const calculateCenter = (points) => {
  const length = points.length / 3
  const sum = points.reduce(
    (acc, value, index) => {
      acc[index % 3] += value
      return acc
    },
    [0, 0, 0],
  )
  return new THREE.Vector3(sum[0] / length, sum[1] / length, sum[2] / length)
}

function subdivideTriangle(triangle, threshold) {
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

function calculatePolygonArea(polygon) {
  let totalArea = 0

  polygon.forEach((triangle) => {
    totalArea += calculateTriangleArea(triangle)
  })

  return totalArea
}

function calculateTriangleArea(triangle) {
  const { a, b, c } = triangle

  const ab = new THREE.Vector3().subVectors(b, a)
  const ac = new THREE.Vector3().subVectors(c, a)
  const crossProduct = new THREE.Vector3().crossVectors(ab, ac)
  const area = 0.5 * crossProduct.length()

  return area
}

function findClosestPolygon(vertex, polygons, polygonPrefilteringCutoff) {
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

function filterPolygonsByDistance(geometry, points, threshold) {
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

function projectOntoTriangle(vertex, triangle) {
  const [v0, v1, v2] = triangle.vertices
  const normal = triangle.normal.clone().normalize()

  const d = v0.dot(normal)
  const t = (d - vertex.dot(normal)) / normal.dot(normal)
  const projection = vertex.clone().add(normal.clone().multiplyScalar(t))

  return projection
}

function getColorAtPointOnTriangle(point, triangle) {
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

function getIntensityAtPointOnTriangle(point, triangle) {
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
function calculatePolygonIntensity(vertices, intensities) {
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

function calculateTriangleIntensity(triangle) {
  const intensities = triangle.intensities
  const averageIntensity =
    (intensities[0] + intensities[1] + intensities[2]) / 3
  return averageIntensity
}

// Takes a sequence of points [[x, y, z], ...] and
// returns a sequence of triangles [[x1, y1, z1, x2, ...], ...],
// making sure to generate a valid triangulation of the polygon
// Highly inefficient implementation, but we don't triangulate many polygons so it should be fine
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

function determinant(v1, v2, v3) {
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

function sub(v1, v2) {
  return new THREE.Vector3().subVectors(v1, v2)
}

function cross(v1, v2) {
  return new THREE.Vector3().crossVectors(v1, v2)
}

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
