import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

import { extend, useFrame, useThree } from "@react-three/fiber"
import React, { useEffect, useRef } from "react"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

extend({ OrbitControls })

export default function DrawPVControl(props) {
  const controls = useRef()
  const { camera, gl } = useThree()

  camera.far = 10000
  camera.position.set(props.middle.x, props.middle.y, props.middle.z)
  const offset = new THREE.Vector3(0, -40, 80)
  camera.position.add(offset)
  camera.lookAt(props.middle)
  camera.up = new THREE.Vector3(0, 0, 1)

  useEffect(() => {
    if (controls.current) {
      controls.current.target = props.middle // Set your desired target
      controls.current.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }

      controls.current.screenSpacePanning = false
      controls.current.maxPolarAngle = Math.PI / 2
      controls.current.update()
    }
  }, [])

  useFrame(() => {
    controls.current.update()
  })

  return <orbitControls ref={controls} args={[camera, gl.domElement]} />
}

function createPolygon(clickedPoints) {
  if (clickedPoints.length < 3) {
    console.log("Not enough points to create a polygon")
    return
  }

  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const colors = []
  clickedPoints.forEach((point, index) => {
    vertices.push(point.x, point.y, point.z)
    const color = pointColors[index]
    colors.push(color.r, color.g, color.b)
  })

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  )
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

  const indices = THREE.ShapeUtils.triangulateShape(clickedPoints, [])
  let triangles = indices.map((index) => ({
    a: new THREE.Vector3(
      vertices[index[0] * 3],
      vertices[index[0] * 3 + 1],
      vertices[index[0] * 3 + 2]
    ),
    b: new THREE.Vector3(
      vertices[index[1] * 3],
      vertices[index[1] * 3 + 1],
      vertices[index[1] * 3 + 2]
    ),
    c: new THREE.Vector3(
      vertices[index[2] * 3],
      vertices[index[2] * 3 + 1],
      vertices[index[2] * 3 + 2]
    ),
  }))

  triangles = triangles.flatMap((triangle) =>
    subdivideTriangle(triangle, TRIANGLE_SUBDIVSION_THRESHOLD)
  )

  prefilteredPolygons = filterPolygonsByDistance(
    scene,
    clickedPoints,
    POLYGON_PREFILTERING_CUTOFF
  )

  const newVertices = []
  const newIndices = []
  const newColors = []
  const newIntensities = []
  triangles.forEach((triangle) => {
    const startIndex = newVertices.length / 3
    newVertices.push(triangle.a.x, triangle.a.y, triangle.a.z)
    newVertices.push(triangle.b.x, triangle.b.y, triangle.b.z)
    newVertices.push(triangle.c.x, triangle.c.y, triangle.c.z)
    newIndices.push(startIndex, startIndex + 1, startIndex + 2)
  })

  for (let i = 0; i < newVertices.length; i += 3) {
    const vertex = new THREE.Vector3(
      newVertices[i],
      newVertices[i + 1],
      newVertices[i + 2]
    )
    const closestPolygon = findClosestPolygon(vertex, prefilteredPolygons)
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
  console.log("Polygon Area:", polygonArea)
  console.log("Polygon Intensity:", polygonIntensity)

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(newVertices, 3)
  )
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(newColors, 3))
  geometry.setIndex(newIndices)

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)

  scene.add(mesh)
  drawnObjects.push(mesh)
  console.log("Polygon created")

  const edges = new THREE.EdgesGeometry(geometry)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
  const lines = new THREE.LineSegments(edges, lineMaterial)
  scene.add(lines)
  drawnObjects.push(lines)

  const wireframeGeometry = new THREE.WireframeGeometry(geometry)
  const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc })
  const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
  scene.add(wireframe)
  drawnObjects.push(wireframe)

  const centroid = calculateCentroid(newVertices)
  const sprite = createSprite(
    `Fläche: ${polygonArea.toFixed(2)} qm\nJahresertrag:${annualYield.toFixed(
      1
    )} kWh`,
    centroid
  )
  scene.add(sprite)
  drawnObjects.push(sprite)

  clickedPoints = []
  pointColors = []

  // Add the new yield to the array and update the legend
  polygonYields.push(annualYield.toFixed(1))
}
