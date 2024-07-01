import { vec3 } from "gl-matrix"

export function loadSTL(model) {
  return new Promise((resolve, reject) => {
    new THREE.STLLoader().load(
      model,
      function (geometry) {
        // Extract the position and normal arrays from the geometry
        const positionArray = geometry.attributes.position.array
        //const normalArray = geometry.attributes.normal.array;

        const triangles = []

        for (let i = 0; i < positionArray.length; i += 9) {
          const triangle = [
            Array.from(positionArray.slice(i, i + 3)),
            Array.from(positionArray.slice(i + 3, i + 6)),
            Array.from(positionArray.slice(i + 6, i + 9)),
          ]

          triangles.push(triangle.map((v) => vec3.fromValues(...v)))
        }

        const threshold = 0.1 // Set your desired threshold value here
        const subdividedTriangles = adaptiveSubdivideMesh(triangles, threshold)

        // Return the arrays in an object
        resolve({
          original_vertices: positionArray,
          subdivided_triangles: subdividedTriangles,
        })
      },
      undefined,
      reject
    )
  })
}

export function subdivideTriangle(triangle) {
  const [v0, v1, v2] = triangle

  const m01 = vec3.clone(v0)
  const m12 = vec3.clone(v1)
  const m20 = vec3.clone(v2)

  vec3.lerp(m01, v0, v1, 0.5)
  vec3.lerp(m12, v1, v2, 0.5)
  vec3.lerp(m20, v2, v0, 0.5)

  return [
    [v0, m01, m20],
    [v1, m12, m01],
    [v2, m20, m12],
    [m01, m12, m20],
  ]
}

export function adaptiveSubdivideMesh(triangles, threshold) {
  const subdividedTrianglesList = []

  for (const triangle of triangles) {
    let trianglesToSubdivide = [triangle]

    while (trianglesToSubdivide.length > 0) {
      const currentTriangle = trianglesToSubdivide.pop()

      const edge1 = vec3.create()
      const edge2 = vec3.create()

      vec3.sub(edge1, currentTriangle[1], currentTriangle[0])
      vec3.sub(edge2, currentTriangle[2], currentTriangle[0])

      const crossProduct = vec3.create()
      vec3.cross(crossProduct, edge1, edge2)
      const area = 0.5 * vec3.len(crossProduct)

      let lengthEdge1
      let lengthEdge2

      lengthEdge1 = vec3.dot(edge1, edge1)
      lengthEdge2 = vec3.dot(edge2, edge2)

      if (area <= threshold && Math.max(lengthEdge1, lengthEdge2) <= 1) {
        subdividedTrianglesList.push(currentTriangle)
      } else {
        const subdividedTriangles = subdivideTriangle(currentTriangle)
        trianglesToSubdivide.push(...subdividedTriangles)
      }
    }
  }

  return subdividedTrianglesList
}
