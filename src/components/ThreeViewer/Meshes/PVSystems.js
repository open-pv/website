import React, { useRef } from "react"
import { useFrame } from "react-three-fiber"
import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import TextSprite from "../TextSprite"

export const PVSystems = ({ pvSystems }) => {
  return (
    <>
      {pvSystems.map((system, index) => (
        <PVSystem
          key={index}
          geometry={system.geometry}
          annualYield={system.annualYield}
          area={system.area}
        />
      ))}
    </>
  )
}

export function createPVSystem({
  setPVSystems,
  pvPoints,
  setPVPoints,
  simulationMeshes,
}) {
  const points = pvPoints.map((obj) => obj.point)
  if (pvPoints.length < 3) {
    console.log("Not enough points to create a polygon")
    return
  }
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  points.forEach((point) => {
    vertices.push(point.x, point.y, point.z)
  })

  const triangles = []
  const bufferTriangles = []
  const normalOffset = 0.1 // Adjust this value as needed

  for (let i = 1; i < pvPoints.length - 1; i++) {
    const v0 = pvPoints[0]
    const v1 = pvPoints[i]
    const v2 = pvPoints[i + 1]

    const shift = (element) => ({
      x: element.point.x + element.normal.x * normalOffset,
      y: element.point.y + element.normal.y * normalOffset,
      z: element.point.z + element.normal.z * normalOffset,
    })

    const sv0 = shift(v0)
    const sv1 = shift(v1)
    const sv2 = shift(v2)

    triangles.push({ a: v0.point, b: v1.point, c: v2.point })
    bufferTriangles.push(
      sv0.x,
      sv0.y,
      sv0.z,
      sv1.x,
      sv1.y,
      sv1.z,
      sv2.x,
      sv2.y,
      sv2.z
    )
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(bufferTriangles, 3)
  )

  let subdividedTriangles = []
  const triangleSubdivisionThreshold = 0.8
  triangles.forEach((triangle) => {
    subdividedTriangles = subdividedTriangles.concat(
      subdivideTriangle(triangle, triangleSubdivisionThreshold)
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
    true
  )
  const polygonPrefilteringCutoff = 10
  const prefilteredPolygons = filterPolygonsByDistance(
    simulationGeometry,
    points,
    polygonPrefilteringCutoff
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
      newVertices[i + 2]
    )
    const closestPolygon = findClosestPolygon(
      vertex,
      prefilteredPolygons,
      polygonPrefilteringCutoff
    )
    if (closestPolygon) {
      const projectedVertex = projectOntoTriangle(vertex, closestPolygon)
      const color = getColorAtPointOnTriangle(projectedVertex, closestPolygon)
      const intensity = getIntensityAtPointOnTriangle(
        projectedVertex,
        closestPolygon
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
    newIntensities
  )
  const annualYield = polygonArea * polygonIntensity

  const newPVSystem = {
    geometry: geometry,
    annualYield: annualYield,
    area: polygonArea,
  }

  setPVSystems((prevSystems) => [...prevSystems, newPVSystem])
  setPVPoints([])
}

const PVSystem = ({ geometry, annualYield, area }) => {
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
            color: "#2b2c40",
            transparent: true,
            opacity: 0.5,
            metalness: 1,
          })
        }
      />

      <TextSprite
        text={`Jahresertrag: ${Math.round(annualYield).toLocaleString(
          "de"
        )} kWh pro Jahr\nFläche: ${area.toPrecision(3)}m²`}
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
    [0, 0, 0]
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
      `Error: Trying to create a polygon with a distance longer than the threshold (${minDistance})`
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
      positions[i + 2]
    )
    const v1 = new THREE.Vector3(
      positions[i + 3],
      positions[i + 4],
      positions[i + 5]
    )
    const v2 = new THREE.Vector3(
      positions[i + 6],
      positions[i + 7],
      positions[i + 8]
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
        point.distanceTo(v2)
      )
      if (distance < minDistance) {
        minDistance = distance
      }
    })

    if (minDistance < threshold) {
      const normal = new THREE.Triangle(v0, v1, v2).getNormal(
        new THREE.Vector3()
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
    new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0))
  )
  const areaPBC = normal.dot(
    new THREE.Vector3().crossVectors(
      v1.clone().sub(point),
      v2.clone().sub(point)
    )
  )
  const areaPCA = normal.dot(
    new THREE.Vector3().crossVectors(
      v2.clone().sub(point),
      v0.clone().sub(point)
    )
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
    new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0))
  )
  const areaPBC = normal.dot(
    new THREE.Vector3().crossVectors(
      v1.clone().sub(point),
      v2.clone().sub(point)
    )
  )
  const areaPCA = normal.dot(
    new THREE.Vector3().crossVectors(
      v2.clone().sub(point),
      v0.clone().sub(point)
    )
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
        vertices[i * 9 + 2]
      ),
      b: new THREE.Vector3(
        vertices[i * 9 + 3],
        vertices[i * 9 + 4],
        vertices[i * 9 + 5]
      ),
      c: new THREE.Vector3(
        vertices[i * 9 + 6],
        vertices[i * 9 + 7],
        vertices[i * 9 + 8]
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
