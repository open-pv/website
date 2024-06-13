// This is the only file where both functionality and GUI stuff is allowed

import Scene from "@openpv/simshady";
import { downloadBuildings } from "./download";
import { setLocation } from "./location";
import { processGeometries } from "./preprocessing";
import { showMesh } from "./viewer";
import * as THREE from "three"

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location);
    for(let b of buildingGeometries) {
      console.log(b);
      b.computeBoundingBox();
      console.log(b.boundingBox);
    }

    // TODO: Dynamically call this when sliders are moved instead of re-downloading everything
    const { simulationGeometry, surroundingGeometry } = processGeometries(buildingGeometries);

    const scene = new Scene(location.lat, location.lon);
    scene.addSimulationGeometry(simulationGeometry);
    scene.addShadingGeometry(simulationGeometry);
    scene.addShadingGeometry(surroundingGeometry);

    const simMaterial = new THREE.MeshLambertMaterial({
      vertexColors: false,
      side: THREE.DoubleSide,
      color: 0xff0000,
      roughness: 1.0,
      metalness: 0.0
    })
    var simulationMesh = new THREE.Mesh(simulationGeometry, simMaterial)
    // const simulationMesh = await scene.calculate(window.numSimulations);
    window.setLoading(false);
    showMesh(simulationMesh, surroundingGeometry, inputChanged);
  } else {
    window.setLoading(false)
    window.setShowThreeViewer(false)
    window.setShowErrorMessage(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
