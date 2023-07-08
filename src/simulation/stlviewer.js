import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

export var scene = null;
export var renderer = null;
export var camera = null;
export var controls = null;

export function STLViewerEnable(classname) {
  var model = document.getElementsByClassName(classname)[0];
  STLViewer(model);
}

export function STLViewer(resetCamera = true) {
  const elem = document.getElementsByClassName("three-viewer")[0];

  elem.style.width = "100%";
  elem.style.height = "400px";

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  if (camera != null) {
    console.log("ResetCamera", resetCamera);
    console.log("CameraPos", camera.position);
    console.log("CameraRotation", camera.rotation);
  }
  if (resetCamera == false || camera == null) {
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
}
