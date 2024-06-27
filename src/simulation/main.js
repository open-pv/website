// This is the only file where both functionality and GUI stuff is allowed

import ShadingScene from "@openpv/simshady";
import * as THREE from "three";
import { downloadBuildings } from "./download";
import { setLocation } from "./location";
import { processGeometries } from "./preprocessing";
import { initializeViewer, swapSimulationMesh } from "./viewer";

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location);

    // TODO: Dynamically call this when sliders are moved instead of re-downloading everything
    const geometries = processGeometries(buildingGeometries);
    for(let k of Object.keys(geometries)) {
      console.log(k, geometries[k]);
    }
    const scene = new ShadingScene(location.lat, location.lon);
    geometries.simulation.forEach(geom => scene.addSimulationGeometry(geom));
    geometries.surrounding.forEach(geom => scene.addShadingGeometry(geom));

    initializeViewer(geometries, inputChanged);
    scene.calculate(window.numSimulations).then(simulationMesh => {
      window.setLoading(false);
      console.log(simulationMesh);
      swapSimulationMesh(simulationMesh);
    });
  } else {
    window.setLoading(false)
    window.setShowThreeViewer(false)
    window.setShowErrorMessage(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
