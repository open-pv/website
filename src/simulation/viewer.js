import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import { coordinatesXY15 } from './location.js'
import { loadMapTile } from './download.js'
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

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
export var simulationMesh = null;
var drawnObjects = [];
var prefilteredPolygons = [];
let polygonYields = [];

const POLYGON_PREFILTERING_CUTOFF = 10;
const TRIANGLE_SUBDIVSION_THRESHOLD = 1;
const ANNUAL_YIELD_SCALING_FACTOR = 3.75;

//camera controls
let isTransitioning = false;
let transitionStartTime = 0;
const transitionDuration = 50; // Duration in milliseconds
let startTarget = null;
let endTarget = null;
let startPosition = null;
let endPosition = null;
let mouseCursor = null;

export function STLViewerEnable(classname) {
  var model = document.getElementsByClassName(classname)[0];
  STLViewer(model);
}

export function STLViewer(resetCamera = true) {
  const elem = document.getElementsByClassName("three-viewer")[0];

  elem.style.width = "100%"
  elem.style.height = "700px"

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

  if (resetCamera == false || camera == null) {
    camera = new THREE.PerspectiveCamera(
      45,
      elem.clientWidth / elem.clientHeight,
      1,
      10000
    )
    camera.up = new THREE.Vector3(0, 0, 1)
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

  setupControls();
  setupScene();
  addEventListeners(elem);
  animate();
}

function onRightClick(event) {
  event.preventDefault();
  const elem = document.getElementsByClassName("three-viewer")[0];
  const rect = elem.getBoundingClientRect();

  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const intersectPoint = intersect.point.clone();
    
    // Calculate the offset between the camera and the intersection point
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    
    // Store the start and end positions for interpolation
    startTarget = controls.target.clone();
    endTarget = intersectPoint;
    startPosition = camera.position.clone();
    endPosition = intersectPoint.clone().add(offset);

    // Start the transition
    isTransitioning = true;
    transitionStartTime = performance.now();
  }
}

function setupScene() {
  scene = new THREE.Scene();
  addLightsToScene();
}

function setupControls() {
  controls = new MapControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;

  renderer.domElement.addEventListener('contextmenu', onRightClick, false);
}

function addLightsToScene() {
  let dirLight = new THREE.DirectionalLight(0xffffff, 2.0)
  dirLight.position.set(0, 1., -1.)
  scene.add(dirLight)
  scene.add(new THREE.AmbientLight(0xffffff, 2.0))
  console.log('Adding lights');
}

function addEventListeners(elem) {
  elem.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('keydown', onKeyDown, false);
}

function onWindowResize() {
  const elem = document.getElementsByClassName("three-viewer")[0];
  renderer.setSize(elem.clientWidth, elem.clientHeight);
  camera.aspect = elem.clientWidth / elem.clientHeight;
  camera.updateProjectionMatrix();
}

function onMouseMove(event) {
  const elem = document.getElementsByClassName("three-viewer")[0];
  const rect = elem.getBoundingClientRect();

  lastMousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  lastMousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  /*
  raycaster.setFromCamera(lastMousePosition, camera);
  const intersects = raycaster.intersectObjects(scene.children.filter(obj => !drawnObjects.includes(obj)), true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const point = intersect.point.clone();

    if (mouseCursor) {
      mouseCursor.position.copy(point);
    } else {
      mouseCursor = createMouseCursor(point);
      scene.add(mouseCursor);
    }
  } else {
    if (mouseCursor) {
      scene.remove(mouseCursor);
      mouseCursor = null;
    }
  }
  */
  controls.screenSpacePanning = false
  controls.maxPolarAngle = 1.1 * Math.PI / 2

  /*
  if (clickedPoints.length > 0) {
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const potentialVertex = intersect.point.clone();
      const lastVertex = clickedPoints[clickedPoints.length - 1];
      const distance = potentialVertex.distanceTo(lastVertex);
      console.log('Distance to potential vertex:', distance);
    }
  }
  */
}

function onKeyDown(event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    handleSpaceKey();
  } else if (event.code === 'KeyP') {
    createPolygon();
  } else if (event.code === 'KeyR') {
    resetScene();
  }
}

function handleSpaceKey() {
  raycaster.setFromCamera(lastMousePosition, camera);
  const intersects = raycaster.intersectObjects(scene.children.filter(obj => !drawnObjects.includes(obj)), true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const offsetPoint = intersect.face
      ? intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(0.1))
      : intersect.point.clone();

    clickedPoints.push(offsetPoint);
    pointColors.push(getColorAtIntersection(intersect));
    console.log('Color at intersection:', pointColors[pointColors.length - 1].getStyle());

    if (cursor) {
      scene.remove(cursor);
    }

    cursor = createCursor(offsetPoint);
    scene.add(cursor);
    console.log('Cursor added at:', offsetPoint);
  } else {
    console.log('No intersection found');
  }
}

function getColorAtIntersection(intersect) {
  const uv = intersect.uv;
  const material = intersect.object.material;

  if (material.map && material.map.image && uv) {
    const { image } = material.map;
    const { width, height } = image;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    const x = Math.floor(uv.x * width);
    const y = Math.floor((1 - uv.y) * height);
    const pixel = context.getImageData(x, y, 1, 1).data;

    return new THREE.Color(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255);
  }

  if (material.color) {
    return material.color.clone();
  }

  return new THREE.Color(0xffffff);
}

function createCursor(position) {
  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  return mesh;
}

function createMouseCursor(position) {
  const geometry = new THREE.SphereGeometry(0.05, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  return mesh;
}

function createSprite(text, position) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 640;
  canvas.height = 128;

  context.font = '55px Arial';
  context.fillStyle = 'white';

  context.fillStyle = 'rgba(0, 0, 0, 0.3)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const lines = text.split('\n');
  context.font = '55px Arial';
  context.fillStyle = 'white';
  lines.forEach((line, index) => {
    context.fillText(line, 10, 60 + index * 60);
  });

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    depthTest: false  
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(position);
  sprite.scale.set(5, 1, 1);
  sprite.renderOrder = 999;
  return sprite;
}

function createPolygon() {
  if (clickedPoints.length < 3) {
    console.log('Not enough points to create a polygon');
    return;
  }

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  clickedPoints.forEach((point, index) => {
    vertices.push(point.x, point.y, point.z);
    const color = pointColors[index];
    colors.push(color.r, color.g, color.b);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const indices = THREE.ShapeUtils.triangulateShape(clickedPoints, []);
  let triangles = indices.map(index => ({
    a: new THREE.Vector3(vertices[index[0] * 3], vertices[index[0] * 3 + 1], vertices[index[0] * 3 + 2]),
    b: new THREE.Vector3(vertices[index[1] * 3], vertices[index[1] * 3 + 1], vertices[index[1] * 3 + 2]),
    c: new THREE.Vector3(vertices[index[2] * 3], vertices[index[2] * 3 + 1], vertices[index[2] * 3 + 2]),
  }));

  triangles = triangles.flatMap(triangle => subdivideTriangle(triangle, TRIANGLE_SUBDIVSION_THRESHOLD));

  prefilteredPolygons = filterPolygonsByDistance(scene, clickedPoints, POLYGON_PREFILTERING_CUTOFF);

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

  for (let i = 0; i < newVertices.length; i += 3) {
    const vertex = new THREE.Vector3(newVertices[i], newVertices[i + 1], newVertices[i + 2]);
    const closestPolygon = findClosestPolygon(vertex, prefilteredPolygons);
    if (closestPolygon) {
      const projectedVertex = projectOntoTriangle(vertex, closestPolygon);
      const color = getColorAtPointOnTriangle(projectedVertex, closestPolygon);
      const intensity = getIntensityAtPointOnTriangle(projectedVertex, closestPolygon);
      newColors.push(color.r, color.g, color.b);
      newIntensities.push(intensity);
    } else {
      newColors.push(1, 1, 1);
      newIntensities.push(-1);
    }
  }

  const polygonArea = calculatePolygonArea(triangles);
  const polygonIntensity = calculatePolygonIntensity(newVertices, newIntensities);
  const annualYield = polygonArea * polygonIntensity * ANNUAL_YIELD_SCALING_FACTOR;
  console.log('Polygon Area:', polygonArea);
  console.log('Polygon Intensity:', polygonIntensity);

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
  geometry.setIndex(newIndices);

  const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
  drawnObjects.push(mesh);
  console.log('Polygon created');

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const lines = new THREE.LineSegments(edges, lineMaterial);
  scene.add(lines);
  drawnObjects.push(lines);

  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
  const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
  scene.add(wireframe);
  drawnObjects.push(wireframe);

  const centroid = calculateCentroid(newVertices);
  const sprite = createSprite(`Fläche: ${polygonArea.toFixed(2)} qm\nJahresertrag:${annualYield.toFixed(1)} kWh`, centroid);
  scene.add(sprite);
  drawnObjects.push(sprite);

  clickedPoints = [];
  pointColors = [];

  // Add the new yield to the array and update the legend
  polygonYields.push(annualYield.toFixed(1));

}

function calculateCentroid(vertices) {
  const numVertices = vertices.length / 3;
  const centroid = new THREE.Vector3();

  for (let i = 0; i < numVertices; i++) {
    centroid.x += vertices[i * 3];
    centroid.y += vertices[i * 3 + 1];
    centroid.z += vertices[i * 3 + 2] + 0.2;
  }

  centroid.divideScalar(numVertices);

  return centroid;
}

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
        ...subdivideTriangle({ a: longestEdgeMidpoint, b: triangle.b, c: triangle.c }, threshold),
      ];
    } else if (bc >= ab && bc >= ca) {
      longestEdgeMidpoint = triangle.b.clone().add(triangle.c).multiplyScalar(0.5);
      return [
        ...subdivideTriangle({ a: triangle.a, b: triangle.b, c: longestEdgeMidpoint }, threshold),
        ...subdivideTriangle({ a: triangle.a, b: longestEdgeMidpoint, c: triangle.c }, threshold),
      ];
    } else {
      longestEdgeMidpoint = triangle.c.clone().add(triangle.a).multiplyScalar(0.5);
      return [
        ...subdivideTriangle({ a: triangle.a, b: triangle.b, c: longestEdgeMidpoint }, threshold),
        ...subdivideTriangle({ a: longestEdgeMidpoint, b: triangle.b, c: triangle.c }, threshold),
      ];
    }
  } else {
    return [triangle];
  }
}

function calculateTriangleIntensity(triangle) {
  const intensities = triangle.intensities;
  const averageIntensity = (intensities[0] + intensities[1] + intensities[2]) / 3;
  return averageIntensity;
}

function calculatePolygonIntensity(vertices, intensities) {
  const numTriangles = vertices.length / 9;
  let totalIntensity = 0;
  let totalArea = 0;

  for (let i = 0; i < numTriangles; i++) {
    const triangle = {
      a: new THREE.Vector3(vertices[i * 9], vertices[i * 9 + 1], vertices[i * 9 + 2]),
      b: new THREE.Vector3(vertices[i * 9 + 3], vertices[i * 9 + 4], vertices[i * 9 + 5]),
      c: new THREE.Vector3(vertices[i * 9 + 6], vertices[i * 9 + 7], vertices[i * 9 + 8]),
      intensities: [
        intensities[i * 3],
        intensities[i * 3 + 1],
        intensities[i * 3 + 2],
      ],
    };

    const triangleArea = calculateTriangleArea(triangle);
    const triangleIntensity = calculateTriangleIntensity(triangle);
    totalIntensity += triangleIntensity * triangleArea;
    totalArea += triangleArea;
  }

  const averageIntensity = totalIntensity / totalArea;
  console.log('Average Intensity:', averageIntensity);
  return averageIntensity;
}

function calculatePolygonArea(polygon) {
  let totalArea = 0;
  
  polygon.forEach(triangle => {
    totalArea += calculateTriangleArea(triangle);
  });

  return totalArea;
}

function calculateTriangleArea(triangle) {
  const { a, b, c } = triangle;

  const ab = new THREE.Vector3().subVectors(b, a);
  const ac = new THREE.Vector3().subVectors(c, a);
  const crossProduct = new THREE.Vector3().crossVectors(ab, ac);
  const area = 0.5 * crossProduct.length();

  return area;
}

function filterPolygonsByDistance(scene, points, threshold) {
  const filteredPolygons = [];

  scene.traverse(child => {
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

        const intensity1 = intensities ? intensities[i / 3] : -1000;
        const intensity2 = intensities ? intensities[i / 3 + 1] : -1000;
        const intensity3 = intensities ? intensities[i / 3 + 2] : -1000;

        let minDistance = Infinity;
        points.forEach(point => {
          const distance = Math.min(point.distanceTo(v0), point.distanceTo(v1), point.distanceTo(v2));
          if (distance < minDistance) {
            minDistance = distance;
          }
        });

        if (minDistance < threshold) {
          const normal = new THREE.Triangle(v0, v1, v2).getNormal(new THREE.Vector3());
          filteredPolygons.push({
            vertices: [v0, v1, v2],
            colors: [color0, color1, color2],
            normal,
            intensities: [intensity1, intensity2, intensity3],
          });
        }
      }
    }
  });

  console.log('Filtered polygons:', filteredPolygons);

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

  if (minDistance >= POLYGON_PREFILTERING_CUTOFF) {
    console.error(`Error: Trying to create a polygon with a distance longer than the threshold (${minDistance})`);
  }

  return closestPolygon;
}

function projectOntoTriangle(vertex, triangle) {
  const [v0, v1, v2] = triangle.vertices;
  const normal = triangle.normal.clone().normalize();

  const d = v0.dot(normal);
  const t = (d - vertex.dot(normal)) / normal.dot(normal);
  const projection = vertex.clone().add(normal.clone().multiplyScalar(t));

  return projection;
}

function getColorAtPointOnTriangle(point, triangle) {
  const [v0, v1, v2] = triangle.vertices;
  const normal = triangle.normal.clone().normalize();

  const areaABC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)));
  const areaPBC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(point), v2.clone().sub(point)));
  const areaPCA = normal.dot(new THREE.Vector3().crossVectors(v2.clone().sub(point), v0.clone().sub(point)));

  const u = areaPBC / areaABC;
  const v = areaPCA / areaABC;
  const w = 1 - u - v;

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

  const areaABC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0)));
  const areaPBC = normal.dot(new THREE.Vector3().crossVectors(v1.clone().sub(point), v2.clone().sub(point)));
  const areaPCA = normal.dot(new THREE.Vector3().crossVectors(v2.clone().sub(point), v0.clone().sub(point)));

  const u = areaPBC / areaABC;
  const v = areaPCA / areaABC;
  const w = 1 - u - v;

  const intensity0 = triangle.intensities[0];
  const intensity1 = triangle.intensities[1];
  const intensity2 = triangle.intensities[2];

  const intensityAtPoint = u * intensity0 + v * intensity1 + w * intensity2;

  return intensityAtPoint;
}

function resetScene() {
  drawnObjects.forEach(object => scene.remove(object));
  drawnObjects = [];
  clickedPoints = [];
  pointColors = [];
  polygonYields = [];
  console.log('Scene reset');
}

function animate() {
  requestAnimationFrame(animate);

  if (isTransitioning) {
    const currentTime = performance.now();
    const elapsedTime = currentTime - transitionStartTime;
    const t = Math.min(elapsedTime / transitionDuration, 1);

    controls.target.lerpVectors(startTarget, endTarget, t);
    camera.position.lerpVectors(startPosition, endPosition, t);

    if (t === 1) {
      isTransitioning = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

export async function initializeViewer(geometries, resetCamera) {
  var oldCameraPosition
  if (resetCamera || camera == null) {
    oldCameraPosition = { x: 0, y: 0, z: 0 }
  } else {
    oldCameraPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    }
  }

  STLViewer(resetCamera);

  const simGeometry = BufferGeometryUtils.mergeGeometries(geometries.simulation)
  const simMaterial = new THREE.MeshLambertMaterial({
    vertexColors: false,
    side: THREE.DoubleSide,
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0
  })
  simulationMesh = new THREE.Mesh(simGeometry, simMaterial)

  let middle = new THREE.Vector3()
  simGeometry.computeBoundingBox()
  simGeometry.boundingBox.getCenter(middle)

  scene.add(simulationMesh);

  var surroundingMaterial = new THREE.MeshStandardMaterial({
    vertexColors: false,
    side: THREE.DoubleSide,
    color: 0xd1bea4,
    metalness: 0.0,
  })
  const surroundingGeometry = BufferGeometryUtils.mergeGeometries(geometries.surrounding);
  var surroundingMesh = new THREE.Mesh(surroundingGeometry, surroundingMaterial)
  scene.add(surroundingMesh)

  const backgroundGeometry = BufferGeometryUtils.mergeGeometries(geometries.background);
  const backgroundMaterial = new THREE.MeshLambertMaterial({
    vertexColors: false,
    side: THREE.DoubleSide,
    color: 0xcccccc,
    transparent: true,
    opacity: 0.3,
  })
  var backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
  scene.add(backgroundMesh)

  /// Add map below the buildings
  const [x, y] = coordinatesXY15;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for(let dx = -5; dx <= 5; dx++) {
    for(let dy = -5; dy <= 5; dy++) {
        loadMapTile(tx*4 + dx, ty*4 + dy, 17).then(mesh => scene.add(mesh));
    }
  }

  /* Debugging Overlay of 3D Tile boundaries
  for(let dx = -1; dx <= 1; dx++) {
    for(let dy = -1; dy <= 1; dy++) {
      const geometry = new THREE.BoxGeometry(1222.992452, 1222.992452, 100); 
      geometry.translate(
         1222.992452 * (tx + dx + 0.5 - x),
        -1222.992452 * (ty + dy + 0.5 - y),
        middle.z);
      const edges = new THREE.EdgesGeometry( geometry ); 
      const line = new THREE.LineSegments(edges,
        new THREE.LineBasicMaterial( { color: 0x0000ff } ) );
      scene.add( line );
    }
  }
  */

  /// End map code

  /* Debugging display of origin
  Axis Arrows for Debugging
  const x_unit = new THREE.Vector3( 1, 0, 0 );
  const y_unit = new THREE.Vector3( 0, 1, 0 );
  const z_unit = new THREE.Vector3( 0, 0, 1 );
  const origin = new THREE.Vector3( 0, 0, 0 );
  scene.add( new THREE.ArrowHelper(x_unit, origin, 30.0, 0xff0000));
  scene.add( new THREE.ArrowHelper(y_unit, origin, 30.0, 0x00ff00));
  scene.add( new THREE.ArrowHelper(z_unit, origin, 30.0, 0x0000ff));
  */

  camera.position.set(middle.x, middle.y, middle.z);
  const offset = new THREE.Vector3(0, -40, 80);
  camera.position.add(offset);
  camera.lookAt(middle);
  controls.target.set(middle.x, middle.y, middle.z)

  var animate = function () {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  window.setShowViridisLegend(true)
  animate()

  let caster = new THREE.Raycaster();
  window.addEventListener('click', function(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = {
      x: ((event.clientX - rect.x) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.y) / rect.height) * 2 + 1
    };
    caster.setFromCamera(mouse, camera);
    const intersects = caster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const face = intersection.face;

      try {
        const colorAttribute = intersection.object.geometry.getAttribute('color');

        const r = colorAttribute.getX(face.a);
        const g = colorAttribute.getY(face.a);
        const b = colorAttribute.getZ(face.a);

        const color = new THREE.Color(0xff0000);
        colorAttribute.setXYZ(face.a, color.r, color.g, color.b);
        colorAttribute.setXYZ(face.b, color.r, color.g, color.b);
        colorAttribute.setXYZ(face.c, color.r, color.g, color.b);
        colorAttribute.needsUpdate = true;

        window.setTimeout(function() {
          colorAttribute.setXYZ(face.a, r, g, b);
          colorAttribute.setXYZ(face.b, r, g, b);
          colorAttribute.setXYZ(face.c, r, g, b);
          colorAttribute.needsUpdate = true;
        }, 500);
      } catch {
        console.warn("Clicked on triangle without color attribute");
      }

      console.log('Clicked on Triangle #', face.a / 3);
    }
  });

}

export function swapSimulationMesh(newMesh) {
  if(simulationMesh) {
    scene.remove(simulationMesh)
  }
  simulationMesh = newMesh;
  scene.add(simulationMesh);
}
