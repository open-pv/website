// This is the only file where both functionality and GUI stuff is allowed

import Scene from "@openpv/simshady";
import { downloadBuildings } from "./download";
import { setLocation } from "./location";
import { processGeometries } from "./preprocessing";
import { showMesh } from "./viewer";

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    const stlStrings = await downloadBuildings(location);

    console.log(stlStrings);

    // TODO: Dynamically call this when sliders are moved instead of re-downloading everything
    const { simulationGeometry, surroundingGeometry } = processGeometries(stlStrings);

    const scene = new Scene(location.lat, location.lon);
    scene.addSimulationGeometry(simulationGeometry);
    scene.addShadingGeometry(simulationGeometry);
    scene.addShadingGeometry(surroundingGeometry);

    const simulationMesh = await scene.calculate(window.numSimulations);

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
