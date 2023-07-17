import * as THREE from "three";

import { scene, renderer, camera, controls, STLViewer } from "./stlviewer.js";
import { adaptiveSubdivideMesh } from "./stl_to_array.js";
import { vec3 } from "gl-matrix";
// import init, { Session, Input} from "@webonnx/wonnx-wasm";
// import { cumulativeIntensityMesh } from './glmatrix_raytracing/glmatrix_raytracing.js';
import SunCalc from "suncalc";
import { loc_utm } from "./download.js";
import { intensity_colormap } from "./utils.js";
import { rayTracingWebGL } from "./webgl_raytracing.js";
//import { triangleIntersectText, Calculate_Shading_at_Point_text } from "./webgl_raytracing.js";
import DatesSlider from "../components/PVSimulation/DatesSlider.js";

// import '@tensorflow/tfjs-backend-webgpu';
// Set the backend to WebGPU and wait for the module to be ready.

// import { STLViewer } from "./stlviewer_2/stlviewer.js";

let raytracingGeometry;
let innerGeometry;
let outerGeometry;
var intensities = null;

export function getViewer() {
  return [scene, renderer, camera, controls];
}

export function retrieveRandomSunDirections(Ndates, lat, lon) {
  const directions = new Float32Array(Ndates * 3);
  var i = 0;
  while (i < Ndates) {
    const date = new Date(
      2023,
      Math.floor(12 * Math.random()),
      1 + Math.floor(28 * Math.random()),
      Math.floor(24 * Math.random()),
      Math.floor(60 * Math.random()),
      0,
      0
    );

    const pos = SunCalc.getPosition(date, lat, lon);
    if (pos.altitude < 0.1 || pos.altitude == Number.NaN) {
      continue;
    }
    directions[3 * i] = -Math.cos(pos.altitude) * Math.sin(pos.azimuth);
    directions[3 * i + 1] = -Math.cos(pos.altitude) * Math.cos(pos.azimuth);
    directions[3 * i + 2] = Math.sin(pos.altitude);
    i += 1;
  }
  return directions;
}

export async function calc_webgl(loc, laser_points, resetCamera) {
  const mesh_vectors = raytracingGeometry.attributes.position.array;
  const points = innerGeometry.attributes.position.array;
  const normals = innerGeometry.attributes.normal.array;

  const status_elem = document.getElementById("status");
  status_elem.textContent = "Simulating";
  status_elem.hasChanged = true;

  let uniquePoints = [];
  let uniqueNormals = [];

  // Create an object to hold point/normal pairs, where the key is a string representation of the point
  const uniquePairs = {};

  for (let i = 0; i < points.length; i += 3) {
    const point = [points[i], points[i + 1], points[i + 2]].map((value) =>
      parseFloat(value.toFixed(6))
    ); // limit precision
    const pointKey = JSON.stringify(point);

    if (!uniquePairs.hasOwnProperty(pointKey)) {
      uniquePairs[pointKey] = i / 3;
      uniquePoints.push(points[i], points[i + 1], points[i + 2]);
      uniqueNormals.push(normals[i], normals[i + 1], normals[i + 2]);
    }
  }

  const uniquePointsArray = new Float32Array(uniquePoints.slice());
  const uniqueNormalsArray = new Float32Array(uniqueNormals.slice());

  // Compute unique intensities
  const uniqueIntensities = await rayTracingWebGL(
    uniquePointsArray,
    mesh_vectors,
    uniqueNormalsArray,
    window.numSimulations,
    loc
  );
  if (uniqueIntensities === null) {
    window.setLoading(false);
    return null;
  }
  // Store unique intensities in uniquePairs
  for (let i = 0; i < uniqueIntensities.length; i++) {
    const point = [
      uniquePoints[i * 3],
      uniquePoints[i * 3 + 1],
      uniquePoints[i * 3 + 2],
    ].map((value) => parseFloat(value.toFixed(6))); // limit precision
    const pointKey = JSON.stringify(point);

    if (uniquePairs.hasOwnProperty(pointKey)) {
      uniquePairs[pointKey] = uniqueIntensities[i];
    } else {
      console.error(`Couldn't find indices for pointKey ${pointKey}`);
    }
  }

  // Generate final intensities array
  let intensities_array = new Array(points.length / 3).fill(0);

  for (let i = 0; i < points.length; i += 3) {
    const point = [points[i], points[i + 1], points[i + 2]].map((value) =>
      parseFloat(value.toFixed(6))
    ); // limit precision
    const pointKey = JSON.stringify(point);

    if (uniquePairs.hasOwnProperty(pointKey)) {
      intensities_array[i / 3] = uniquePairs[pointKey];
    }
  }

  const intensities = new Float32Array(intensities_array);

  status_elem.textContent = "Simulation Done";
  status_elem.hasChanged = true;
  window.setLoading(false);
  showMeshIntensities(intensities, laser_points, resetCamera);
}

function refine_triangles(triangle_array, threshold) {
  const triangles = [
    [
      vec3.fromValues(...triangle_array.slice(0, 3)),
      vec3.fromValues(...triangle_array.slice(3, 6)),
      vec3.fromValues(...triangle_array.slice(6, 9)),
    ],
  ];

  const subdividedTriangles = adaptiveSubdivideMesh(triangles, threshold);

  const newpos_update = [];
  for (const triangle of subdividedTriangles) {
    newpos_update.push(...triangle);
  }
  return newpos_update;
}

function centerMesh(geometry, xytranslate, minZ) {
  // centralize mesh to main point
  var newMinZ;

  if (minZ == null) {
    newMinZ = Number.POSITIVE_INFINITY;

    // Iterate over vertices and find the minimum z value
    for (var i = 0; i < geometry.attributes.position.array.length; i++) {
      const zcoord = geometry.attributes.position.getZ(i);
      if (zcoord < newMinZ) {
        newMinZ = zcoord;
      }
    }
  } else {
    newMinZ = minZ;
  }

  var posarray = geometry.attributes.position.array;
  for (var i = 0; i < posarray.length; i += 9) {
    for (var j = 0; j < 9; j += 3) {
      posarray[i + j] = posarray[i + j] - xytranslate[0];
      posarray[i + j + 1] = posarray[i + j + 1] - xytranslate[1];
      posarray[i + j + 2] = posarray[i + j + 2] - newMinZ;
    }
  }
  console.log("NEWMINZ", newMinZ);
  return newMinZ;
}

function cutoffMesh(geometry, cutoff) {
  var posarray = geometry.attributes.position.array.slice();
  var newposarray = [];
  var newnormals = [];
  for (var i = 0; i < posarray.length; i += 9) {
    var keep = true;
    for (var j = 0; j < 9; j += 3) {
      if (
        posarray[i + j] < -cutoff ||
        posarray[i + j] > cutoff ||
        posarray[i + j + 1] < -cutoff ||
        posarray[i + j + 1] > cutoff
      ) {
        keep = false;
      }
    }

    if (keep) {
      const v0 = vec3.fromValues(...posarray.slice(i, i + 3));
      const v1 = vec3.fromValues(...posarray.slice(i + 3, i + 6));
      const v2 = vec3.fromValues(...posarray.slice(i + 6, i + 9));
      let d1 = vec3.create();
      vec3.sub(d1, v1, v0);
      let d2 = vec3.create();
      vec3.sub(d2, v2, v0);
      let ar = vec3.create();
      vec3.cross(ar, d1, d2);
      var normal = vec3.create();
      vec3.scale(normal, ar, 1 / vec3.len(ar));

      //remove triangles with low area for shading
      if (vec3.len(ar) < 0.05) {
        continue;
      }

      for (var j = 0; j < 9; j++) {
        newposarray.push(posarray[i + j]);
        newnormals.push(normal[j % 3]);
      }
    }
  }

  let new_geometry = new THREE.BufferGeometry();
  new_geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(newposarray), 3)
  );
  new_geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(newnormals), 3)
  );
  new_geometry.attributes.position.needsUpdate = true;
  new_geometry.attributes.normal.needsUpdate = true;
  return new_geometry;
}

function splitCutoffRefineMesh(
  geometry,
  refinementCutoff,
  outerCutoff,
  adaptiveSubdivideThreshold = Number.POSITIVE_INFINITY
) {
  let geometriesCut = cutoffMesh(geometry, outerCutoff);
  var posarray = geometriesCut.attributes.position.array.slice();

  var innerPosarray = [];
  var innerNormals = [];

  var outerPosarray = [];
  var outerNormals = [];

  for (var i = 0; i < posarray.length; i += 9) {
    var isInnerGeometry = true;
    for (var j = 0; j < 9; j += 3) {
      if (
        posarray[i + j] < -refinementCutoff ||
        posarray[i + j] > refinementCutoff ||
        posarray[i + j + 1] < -refinementCutoff ||
        posarray[i + j + 1] > refinementCutoff
      ) {
        isInnerGeometry = false;
        // break;
      }
    }

    const v0 = vec3.fromValues(...posarray.slice(i, i + 3));
    const v1 = vec3.fromValues(...posarray.slice(i + 3, i + 6));
    const v2 = vec3.fromValues(...posarray.slice(i + 6, i + 9));
    let d1 = vec3.create();
    vec3.sub(d1, v1, v0);
    let d2 = vec3.create();
    vec3.sub(d2, v2, v0);
    let ar = vec3.create();
    vec3.cross(ar, d1, d2);
    var normal = vec3.create();
    vec3.scale(normal, ar, 1 / vec3.len(ar));

    if (vec3.len(ar) < 0.05) {
      continue;
    }
    if (isInnerGeometry) {
      var triangle_points = refine_triangles(
        posarray.slice(i, i + 9),
        adaptiveSubdivideThreshold
      );

      for (const triangle of triangle_points) {
        innerPosarray.push(triangle[0]);
        innerPosarray.push(triangle[1]);
        innerPosarray.push(triangle[2]);
        innerNormals.push(normal[0]);
        innerNormals.push(normal[1]);
        innerNormals.push(normal[2]);
      }
    } else {
      for (var j = 0; j < 9; j++) {
        outerPosarray.push(posarray[i + j]);
        outerNormals.push(normal[j % 3]);
      }
    }
  }

  let innerGeometry = new THREE.BufferGeometry();
  innerGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(innerPosarray), 3)
  );
  innerGeometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(innerNormals), 3)
  );
  innerGeometry.attributes.position.needsUpdate = true;
  innerGeometry.attributes.normal.needsUpdate = true;

  let outerGeometry = new THREE.BufferGeometry();
  outerGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(outerPosarray), 3)
  );
  outerGeometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(outerNormals), 3)
  );
  outerGeometry.attributes.position.needsUpdate = true;
  outerGeometry.attributes.normal.needsUpdate = true;

  return { innerGeometry: innerGeometry, outerGeometry: outerGeometry };
}

export function createMeshes(
  big_geometry,
  offset,
  minZ = null,
  cutoffRaytracing = window.numRadiusSimulation + 20,
  outerCutoff = window.numRadiusSimulation + 70,
  refinementCutoff = window.numRadiusSimulation,
  mesh_refinement_scale = 2
) {
  intensities = null;
  //center the big mesh around the building coordinates from OSM
  const newMinZ = centerMesh(
    big_geometry,
    [loc_utm[0] - offset[0], loc_utm[1] - offset[1]],
    minZ
  );

  raytracingGeometry = cutoffMesh(big_geometry, cutoffRaytracing);

  let geometryDict = splitCutoffRefineMesh(
    big_geometry,
    refinementCutoff,
    outerCutoff,
    mesh_refinement_scale
  );
  innerGeometry = geometryDict.innerGeometry;
  outerGeometry = geometryDict.outerGeometry;

  if (innerGeometry.attributes.position.array.length === 0) {
    window.setLoading(false);
    window.setShowErrorMessage(true);
    window.setShowThreeViewer(false);
  }
  return newMinZ;
}

export function showMeshOrig() {
  var elem = document.getElementsByClassName("stlviewer")[0];
  const newelem = document.createElement("div");
  newelem.setAttribute("class", "stlviewer");
  elem.replaceWith(newelem);
  newelem.id = "webgl-container";
  STLViewer(newelem);

  const Npoints = innerGeometry.attributes.position.array.length / 3;
  var newColors = new Float32Array(3 * Npoints);
  for (var i = 0; i < Npoints; i++) {
    newColors[3 * i] = 0.6 + 0.4 * Math.random();
    newColors[3 * i + 1] = 0.4 + 0.3 * Math.random();
    newColors[3 * i + 2] = 0.3 * Math.random();
  }

  innerGeometry.setAttribute("color", new THREE.BufferAttribute(newColors, 3));
  var material = new THREE.MeshStandardMaterial({ vertexColors: true });
  // var material = new THREE.MeshStandardMaterial({ color: 0xd1bea4 });
  var mesh = new THREE.Mesh(innerGeometry, material);
  scene.add(mesh);

  // Compute the middle
  var middle = new THREE.Vector3();
  innerGeometry.computeBoundingBox();
  innerGeometry.boundingBox.getCenter(middle);

  // Center it
  //mesh.position.x = -1 * middle.x;
  //mesh.position.y = -1 * middle.y;
  //mesh.position.z = -1 * middle.z+3;

  // Pull the camera away as needed
  var largestDimension = Math.max(
    innerGeometry.boundingBox.max.x,
    innerGeometry.boundingBox.max.y,
    innerGeometry.boundingBox.max.z
  );
  camera.position.set(0, -20, 100);
  camera.position.z = 40;

  var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
}

export async function replot() {
  showMeshIntensities();
}

export async function showMeshIntensities(
  intensities,
  laser_points,
  resetCamera
) {
  var oldCameraPosition;
  if (resetCamera || camera == null) {
    oldCameraPosition = { x: 0, y: 0, z: 0 };
  } else {
    oldCameraPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
  }

  STLViewer(resetCamera);

  const Npoints = innerGeometry.attributes.position.array.length / 3;
  var newColors = new Float32Array(Npoints * 3);
  //var intMax = get99thPercentile(intensities);
  for (var i = 0; i < Npoints; i++) {
    const col = intensity_colormap(
      Math.min(1, intensities[i] / window.numSimulations / 0.6)
    );
    //The 0.6 comes from looking at a rooftop facing south with good angle.
    newColors[3 * i] = col[0];
    newColors[3 * i + 1] = col[1];
    newColors[3 * i + 2] = col[2];
  }

  innerGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(newColors, 3)
  );
  var material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    shininess: 0,
    roughness: 1,
  });
  // var material = new THREE.MeshStandardMaterial({ color: 0xd1bea4 });
  var mesh = new THREE.Mesh(innerGeometry, material);

  scene.add(mesh);

  var outerGeometryMaterial = new THREE.MeshStandardMaterial({
    vertexColors: false,
    side: THREE.DoubleSide,
    color: 0xd1bea4,
    shininess: 0,
    roughness: 1,
  });
  // var material = new THREE.MeshStandardMaterial({ color: 0xd1bea4 });
  var outerMesh = new THREE.Mesh(outerGeometry, outerGeometryMaterial);

  scene.add(outerMesh);

  // Create a geometry for the spheres
  const sphereGeometry = new THREE.SphereGeometry(0.1); // Adjust the radius as needed

  // Create a material for the spheres
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Adjust the color as needed

  // Create and add a sphere for each point
  for (var i = 0; i < laser_points.length; i++) {
    if (i % 2 == 1) {
      let point = laser_points[i];
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(point[0], point[1], point[2]);
      scene.add(sphere);
    }
  }

  // Compute the middle
  var middle = new THREE.Vector3();
  innerGeometry.computeBoundingBox();
  innerGeometry.boundingBox.getCenter(middle);

  // Pull the camera away as needed
  // var largestDimension = Math.max(
  //   innerGeometry.boundingBox.max.x,
  //   innerGeometry.boundingBox.max.y,
  //   innerGeometry.boundingBox.max.z
  // );

  if (resetCamera) {
    camera.position.set(0, -40, 80);
  } else {
    // console.log("Camera Rot", camera.rotation);

    camera.position.set(
      oldCameraPosition.x - window.offsetPos[0],
      oldCameraPosition.y - window.offsetPos[1],
      oldCameraPosition.z
    );
    // console.log("New Camera Pos", camera.position);
  }

  var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  window.setShowViridisLegend(true);
  animate();
}
