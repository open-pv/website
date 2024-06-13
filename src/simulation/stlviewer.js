import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

export var scene = null;
export var renderer = null;
export var camera = null;
export var controls = null;
export var raycaster = new THREE.Raycaster();
export var mouse = new THREE.Vector2();
export var cursor = null;
export var lastMousePosition = { x: 0, y: 0 };
export var clickedPoints = [];
export var pointColors = [];
var drawnObjects = []; // Store references to all drawn objects
var prefilteredPolygons = []; // Store pre-filtered polygons
const POLYGON_PREFILTERING_CUTOFF = 10;  // Set your desired threshold here
const TRIANGLE_SUBDIVSION_THRESHOLD = 1; 



export function STLViewerEnable(classname) {
  var model = document.getElementsByClassName(classname)[0];
  STLViewer(model);
}

export function STLViewer(resetCamera = true) {
  const elem = document.getElementsByClassName("three-viewer")[0];

  elem.style.width = "100%";
  elem.style.height = "400px";

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  if (resetCamera === false || camera === null) {
    camera = new THREE.PerspectiveCamera(
      45,
      elem.clientWidth / elem.clientHeight,
      1,
      1000
    );
    camera.up = new THREE.Vector3(0, 0, 1);
  }
  renderer.setSize(elem.clientWidth, elem.clientHeight);
  elem.replaceChild(renderer.domElement, elem.firstChild);

  window.addEventListener(
    "resize",
    function () {
      renderer.setSize(elem.clientWidth, elem.clientHeight);
      camera.aspect = elem.clientWidth / elem.clientHeight;
      camera.updateProjectionMatrix();
    },
    false
  );

  controls = new MapControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;

  scene = new THREE.Scene();

  let dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
  dirLight.position.set(0, -0.3, 1);
  scene.add(dirLight);

  let dirLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
  dirLight2.position.set(0.3, -0.3, 1);
  scene.add(dirLight2);

  let dirLight3 = new THREE.DirectionalLight(0xffffff, 0.1);
  dirLight3.position.set(-0.3, -0.3, 1);
  scene.add(dirLight3);
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Event listener for mouse move
  elem.addEventListener('mousemove', onMouseMove, false);

  // Event listener for keydown
  window.addEventListener('keydown', onKeyDown, false);

  animate();
}

function onMouseMove(event) {
  const elem = document.getElementsByClassName("three-viewer")[0];
  const rect = elem.getBoundingClientRect();
  
  lastMousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  lastMousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  if (clickedPoints.length > 0) {
    raycaster.setFromCamera(lastMousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const potentialVertex = intersect.point.clone();
      const lastVertex = clickedPoints[clickedPoints.length - 1];
      const distance = potentialVertex.distanceTo(lastVertex);
      console.log('Distance to potential vertex:', distance);
    }
  }
}

function onKeyDown(event) {
  // Check if the target is an input field
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return; // Allow the event to proceed normally
  }

  if (event.code === 'Space') {
    event.preventDefault();

    raycaster.setFromCamera(lastMousePosition, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      console.log('Intersection found:', intersects[0]);

      const intersect = intersects[0];

      let offsetPoint;
      if (intersect.face) {
        // Offset the point slightly in the direction of the normal
        offsetPoint = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(0.1));
      } else {
        // If face is null, just use the intersection point
        offsetPoint = intersect.point.clone();
      }
      clickedPoints.push(offsetPoint);

      // Get the color at the intersection point
      const color = getColorAtIntersection(intersect);
      pointColors.push(color);

      // Log the color at the intersection point
      console.log('Color at intersection:', color.getStyle());

      if (cursor) {
        scene.remove(cursor);
      }

      const cursorGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const cursorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);

      cursor.position.copy(offsetPoint);
      scene.add(cursor);
      console.log('Cursor added at:', offsetPoint);
    } else {
      console.log('No intersection found');
    }
  } else if (event.code === 'KeyP') {  // Press 'P' to create polygon
    createPolygon(scene);
  } else if (event.code === 'KeyR') {  // Press 'R' to reset
    resetScene();
  }
}

function getColorAtIntersection(intersect) {
  const uv = intersect.uv;
  const material = intersect.object.material;

  if (material.map && material.map.image && uv) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = material.map.image;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);

    const x = Math.floor(uv.x * image.width);
    const y = Math.floor((1 - uv.y) * image.height);  // note the 1 - uv.y
    const pixel = context.getImageData(x, y, 1, 1).data;

    return new THREE.Color(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255);
  }

  if (material.color) {
    return material.color.clone();
  }

  return new THREE.Color(0xffffff); // default to white if no color found
}

function createPolygon(scene) {

  if (clickedPoints.length < 3) {
    console.log('Not enough points to create a polygon');
    return;
  }

  // Create geometry from the clicked points
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(clickedPoints.length * 3);
  const colors = new Float32Array(clickedPoints.length * 3);

  clickedPoints.forEach((point, index) => {
    vertices[index * 3] = point.x;
    vertices[index * 3 + 1] = point.y;
    vertices[index * 3 + 2] = point.z;
    const color = pointColors[index];
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Triangulate the polygon
  const indices = THREE.ShapeUtils.triangulateShape(clickedPoints, []);

  // Subdivide the triangles by splitting the longest side until the longest edge is below the threshold
  let triangles = indices.map(index => {
    return {
      a: new THREE.Vector3(vertices[index[0] * 3], vertices[index[0] * 3 + 1], vertices[index[0] * 3 + 2]),
      b: new THREE.Vector3(vertices[index[1] * 3], vertices[index[1] * 3 + 1], vertices[index[1] * 3 + 2]),
      c: new THREE.Vector3(vertices[index[2] * 3], vertices[index[2] * 3 + 1], vertices[index[2] * 3 + 2])
    };
  });

  function subdivideTriangle(triangle, threshold) {
    const ab = triangle.a.distanceTo(triangle.b);
    const bc = triangle.b.distanceTo(triangle.c);
    const ca = triangle.c.distanceTo(triangle.a);

    if (ab > threshold || bc > threshold || ca > threshold) {
      let longestEdgeMidpoint;
      if (ab >= bc && ab >= ca) {
        longestEdgeMidpoint = triangle.a.clone().add(triangle.b).multiplyScalar(0.5);
        return [
          ...subdivideTriangle({ a: triangle.a, b: longestEdgeMidpoint, c: triangle.c }, threshold),
          ...subdivideTriangle({ a: longestEdgeMidpoint, b: triangle.b, c: triangle.c }, threshold)
        ];
      } else if (bc >= ab && bc >= ca) {
        longestEdgeMidpoint = triangle.b.clone().add(triangle.c).multiplyScalar(0.5);
        return [
          ...subdivideTriangle({ a: triangle.a, b: triangle.b, c: longestEdgeMidpoint }, threshold),
          ...subdivideTriangle({ a: triangle.a, b: longestEdgeMidpoint, c: triangle.c }, threshold)
        ];
      } else {
        longestEdgeMidpoint = triangle.c.clone().add(triangle.a).multiplyScalar(0.5);
        return [
          ...subdivideTriangle({ a: triangle.a, b: triangle.b, c: longestEdgeMidpoint }, threshold),
          ...subdivideTriangle({ a: longestEdgeMidpoint, b: triangle.b, c: triangle.c }, threshold)
        ];
      }
    } else {
      return [triangle];
    }
  }

  triangles = triangles.flatMap(triangle => subdivideTriangle(triangle, TRIANGLE_SUBDIVSION_THRESHOLD));

  // Create new geometry with the subdivided triangles
  const newVertices = [];
  const newIndices = [];
  const newColors = [];
  const newIntensities = [];

  triangles.forEach(triangle => {
    const startIndex = newVertices.length / 3;
    newVertices.push(triangle.a.x, triangle.a.y, triangle.a.z);
    newVertices.push(triangle.b.x, triangle.b.y, triangle.b.z);
    newVertices.push(triangle.c.x, triangle.c.y, triangle.c.z);
    newIndices.push(startIndex, startIndex + 1, startIndex + 2);
  });

  // Project each new vertex onto the closest triangle and get the color
  for (let i = 0; i < newVertices.length; i += 3) {
    const vertex = new THREE.Vector3(newVertices[i], newVertices[i + 1], newVertices[i + 2]);
    const closestPolygon = findClosestPolygon(vertex, prefilteredPolygons);

    if (closestPolygon) {
      const projectedVertex = projectOntoTriangle(vertex, closestPolygon);
      const color = getColorAtPointOnTriangle(projectedVertex, closestPolygon);
      const intensity = getIntensityAtPointOnTriangle(projectedVertex, closestPolygon);
      newColors.push(color.r, color.g, color.b);
      newIntensities.push(intensity)
    } else {
      newColors.push(1, 1, 1);  // Default to white if no closest polygon is found
      newIntensities.push(-1000);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
  geometry.setIndex(newIndices);

  // Log the subdivided triangles and their vertex colors
  console.log('Subdivided triangles and their vertex colors:');
  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    console.log(`Triangle ${i}:`);
    console.log(`  Vertex A: (${triangle.a.x}, ${triangle.a.y}, ${triangle.a.z})`);
    console.log(`  Vertex B: (${triangle.b.x}, ${triangle.b.y}, ${triangle.b.z})`);
    console.log(`  Vertex C: (${triangle.c.x}, ${triangle.c.y}, ${triangle.c.z})`);
    console.log(`  Color A: ${new THREE.Color(newColors[i * 9], newColors[i * 9 + 1], newColors[i * 9 + 2]).getStyle()}`);
    console.log(`  Color B: ${new THREE.Color(newColors[i * 9 + 3], newColors[i * 9 + 4], newColors[i * 9 + 5]).getStyle()}`);
    console.log(`  Color C: ${new THREE.Color(newColors[i * 9 + 6], newColors[i * 9 + 7], newColors[i * 9 + 8]).getStyle()}`);
    console.log(`  Intensity A: ${newIntensities[i*3]}`);
    console.log(`  Intensity B: ${newIntensities[i*3+1]}`);
    console.log(`  Intensity C: ${newIntensities[i*3+2]}`);
  }

  // Create the mesh
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  drawnObjects.push(mesh);
  console.log('Polygon created');

  // Draw the outline
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const lines = new THREE.LineSegments(edges, lineMaterial);
  scene.add(lines);
  drawnObjects.push(lines);

  // Draw the wireframe of the inner triangles in light grey
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
  const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
  scene.add(wireframe);
  drawnObjects.push(wireframe);



  // Pre-filter the polygons based on the threshold
  prefilteredPolygons = filterPolygonsByDistance(scene, clickedPoints, POLYGON_PREFILTERING_CUTOFF);

  clickedPoints = [];
  pointColors = [];
}

function filterPolygonsByDistance(scene, points, threshold) {
  const filteredPolygons = [];

  scene.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;
      if (!geometry.isBufferGeometry) return;

      const positions = geometry.attributes.position.array;
      const colors = geometry.attributes.color ? geometry.attributes.color.array : null;
      const intensities = geometry.intensities ? geometry.intensities : null;

      for (let i = 0; i < positions.length; i += 9) {
        const v0 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        const v1 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
        const v2 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

        const color0 = colors ? new THREE.Color(colors[i], colors[i + 1], colors[i + 2]) : new THREE.Color(1, 1, 1);
        const color1 = colors ? new THREE.Color(colors[i + 3], colors[i + 4], colors[i + 5]) : new THREE.Color(1, 1, 1);
        const color2 = colors ? new THREE.Color(colors[i + 6], colors[i + 7], colors[i + 8]) : new THREE.Color(1, 1, 1);

        const intensity1 = intensities ? intensities[i/3] : -1000;
        const intensity2 = intensities ? intensities[i/3+1]: -1000;
        const intensity3 = intensities ? intensities[i/3+2]: -1000;

        let minDistance = Infinity;
        points.forEach(point => {
          const distance = Math.min(point.distanceTo(v0), point.distanceTo(v1), point.distanceTo(v2));
          if (distance < minDistance) {
            minDistance = distance;
          }
        });

        if (minDistance < threshold) {
          const normal = new THREE.Triangle(v0, v1, v2).getNormal(new THREE.Vector3());
          filteredPolygons.push({ vertices: [v0, v1, v2], colors: [color0, color1, color2], normal, intensities: [intensity1, intensity2, intensity3] });
        }
      }
    }
  });

  console.log('Filtered polygons:', filteredPolygons); // Debugging line to see the filtered polygons

  return filteredPolygons;
}

function findClosestPolygon(vertex, polygons) {
  let closestPolygon = null;
  let minDistance = Infinity;

  polygons.forEach(polygon => {
    const [v0, v1, v2] = polygon.vertices;
    const distance = vertex.distanceTo(v0) + vertex.distanceTo(v1) + vertex.distanceTo(v2);
    if (distance < minDistance) {
      minDistance = distance;
      closestPolygon = polygon;
    }
  });

  if (minDistance >= 1) { // Threshold check
    console.error(`Error: Trying to create a polygon with a distance longer than the threshold (${minDistance})`);
  }

  return closestPolygon;
}

function projectOntoTriangle(vertex, triangle) {
  const [v0, v1, v2] = triangle.vertices;
  const normal = triangle.normal.clone().normalize();

  // Compute the projection of the vertex onto the plane of the triangle
  const d = v0.dot(normal);
  const t = (d - vertex.dot(normal)) / normal.dot(normal);
  const projection = vertex.clone().add(normal.clone().multiplyScalar(t));

  return projection;
}

function getColorAtPointOnTriangle(point, triangle) {
  const [v0, v1, v2] = triangle.vertices;
  const normal = triangle.normal.clone().normalize();

  // Calculate barycentric coordinates
  const areaABC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)));
  const areaPBC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(point), v2.clone().sub(point)));
  const areaPCA = normal.dot(new THREE.Vector3().crossVectors(v2.clone().sub(point), v0.clone().sub(point)));

  const u = areaPBC / areaABC;
  const v = areaPCA / areaABC;
  const w = 1 - u - v;

  // Interpolate the color at the point using barycentric coordinates
  const color0 = triangle.colors[0];
  const color1 = triangle.colors[1];
  const color2 = triangle.colors[2];

  const r = u * color0.r + v * color1.r + w * color2.r;
  const g = u * color0.g + v * color1.g + w * color2.g;
  const b = u * color0.b + v * color1.b + w * color2.b;

  return new THREE.Color(r, g, b);
}

function getIntensityAtPointOnTriangle(point, triangle) {
  const [v0, v1, v2] = triangle.vertices;
  const normal = triangle.normal.clone().normalize();

  // Calculate barycentric coordinates
  const areaABC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)));
  const areaPBC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(point), v2.clone().sub(point)));
  const areaPCA = normal.dot(new THREE.Vector3().crossVectors(v2.clone().sub(point), v0.clone().sub(point)));

  const u = areaPBC / areaABC;
  const v = areaPCA / areaABC;
  const w = 1 - u - v;

  // Interpolate the color at the point using barycentric coordinates
  const intensity0 = triangle.intensities[0];
  const intensity1 = triangle.intensities[1];
  const intensity2 = triangle.intensities[2];

  const intensityAtPoint = u * intensity0 + v * intensity1 + w * intensity2;

  return intensityAtPoint;
}

function resetScene() {
  // Remove all drawn objects from the scene
  drawnObjects.forEach(object => scene.remove(object));
  drawnObjects = [];

  // Clear the clicked points and point colors
  clickedPoints = [];
  pointColors = [];

  console.log('Scene reset');
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
