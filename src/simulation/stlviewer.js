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
  if (event.code === 'Space') {
    event.preventDefault();

    raycaster.setFromCamera(lastMousePosition, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      console.log('Intersection found:', intersects[0]);

      const intersect = intersects[0];

      // Offset the point slightly in the direction of the normal
      const offsetPoint = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(0.1));
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
    createPolygon();
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

function createPolygon() {
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

  // Subdivide the triangles to ensure no side is longer than 0.2
  let triangles = indices.map(index => {
    return {
      a: new THREE.Vector3(vertices[index[0] * 3], vertices[index[0] * 3 + 1], vertices[index[0] * 3 + 2]),
      b: new THREE.Vector3(vertices[index[1] * 3], vertices[index[1] * 3 + 1], vertices[index[1] * 3 + 2]),
      c: new THREE.Vector3(vertices[index[2] * 3], vertices[index[2] * 3 + 1], vertices[index[2] * 3 + 2])
    };
  });

  function subdivideTriangle(triangle) {
    const ab = triangle.a.distanceTo(triangle.b);
    const bc = triangle.b.distanceTo(triangle.c);
    const ca = triangle.c.distanceTo(triangle.a);

    if (ab > 1 || bc > 1 || ca > 1) {
      const midpoint = (p1, p2) => p1.clone().add(p2).multiplyScalar(0.5);
      const abMid = midpoint(triangle.a, triangle.b);
      const bcMid = midpoint(triangle.b, triangle.c);
      const caMid = midpoint(triangle.c, triangle.a);

      const newTriangles = [
        { a: triangle.a, b: abMid, c: caMid },
        { a: abMid, b: triangle.b, c: bcMid },
        { a: caMid, b: bcMid, c: triangle.c },
        { a: abMid, b: bcMid, c: caMid }
      ];

      return newTriangles.flatMap(subdivideTriangle);
    } else {
      return [triangle];
    }
  }

  triangles = triangles.flatMap(subdivideTriangle);

  // Create new geometry with the subdivided triangles
  const newVertices = [];
  const newIndices = [];

  triangles.forEach(triangle => {
    const startIndex = newVertices.length / 3;
    newVertices.push(triangle.a.x, triangle.a.y, triangle.a.z);
    newVertices.push(triangle.b.x, triangle.b.y, triangle.b.z);
    newVertices.push(triangle.c.x, triangle.c.y, triangle.c.z);
    newIndices.push(startIndex, startIndex + 1, startIndex + 2);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
  geometry.setIndex(newIndices);

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

  // Find the closest polygon for each vertex
  for (let i = 0; i < newVertices.length; i += 3) {
    const vertexPosition = new THREE.Vector3(newVertices[i], newVertices[i + 1], newVertices[i + 2]);
    const closestPolygon = findClosestPolygon(vertexPosition);
    console.log(`Vertex ${i / 3}:`);
    console.log(`  Coordinates: (${vertexPosition.x}, ${vertexPosition.y}, ${vertexPosition.z})`);
    console.log(`  Closest polygon ID: ${closestPolygon.id}`);
    console.log(`  Closest polygon vertices: ${JSON.stringify(closestPolygon.vertices)}`);
    console.log(`  Polygon normal: (${closestPolygon.normal.x}, ${closestPolygon.normal.y}, ${closestPolygon.normal.z})`);
  }

  clickedPoints = [];
  pointColors = [];
}

function findClosestPolygon(vertex) {
  let closestPolygon = null;
  let minDistance = Infinity;
  let polygonId = 0;

  scene.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;
      if (!geometry.isBufferGeometry) return;

      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 9) {
        const v0 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        const v1 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
        const v2 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

        const distance = vertex.distanceTo(v0) + vertex.distanceTo(v1) + vertex.distanceTo(v2);
        if (distance < minDistance) {
          minDistance = distance;
          const normal = new THREE.Triangle(v0, v1, v2).getNormal(new THREE.Vector3());
          closestPolygon = { id: polygonId, vertices: [v0, v1, v2], normal };
        }
        polygonId++;
      }
    }
  });

  return closestPolygon;
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
