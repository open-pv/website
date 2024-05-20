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

  // Adding a test cube to the scene
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

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
}

function onKeyDown(event) {
  if (event.code === 'Space') {
    event.preventDefault();

    raycaster.setFromCamera(lastMousePosition, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      console.log('Intersection found:', intersects[0]);

      const intersect = intersects[0];
      clickedPoints.push(intersect.point.clone());

      if (cursor) {
        scene.remove(cursor);
      }

      const cursorGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const cursorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);

      cursor.position.copy(intersect.point);
      scene.add(cursor);
      console.log('Cursor added at:', intersect.point);
    } else {
      console.log('No intersection found');
    }
  } else if (event.code === 'KeyP') {  // Press 'P' to create polygon
    createPolygon();
  }
}

function createPolygon() {
  if (clickedPoints.length < 3) {
    console.log('Not enough points to create a polygon');
    return;
  }

  const shape = new THREE.Shape();
  const startPoint = clickedPoints[0];
  shape.moveTo(startPoint.x, startPoint.y);

  for (let i = 1; i < clickedPoints.length; i++) {
    shape.lineTo(clickedPoints[i].x, clickedPoints[i].y);
  }

  shape.lineTo(startPoint.x, startPoint.y);  // Close the shape

  const extrudeSettings = {
    depth: 1,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const mesh = new THREE.Mesh(geometry, material);

  // Set the z coordinate to match the average z coordinate of the points
  const avgZ = clickedPoints.reduce((sum, point) => sum + point.z, 0) / clickedPoints.length;
  mesh.position.z = avgZ;

  scene.add(mesh);
  console.log('Polygon created');
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
