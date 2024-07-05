// This is the only file where both functionality and GUI stuff is allowed

import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { downloadBuildings } from "./download"
import { setLocation } from "./location"
import { processGeometries } from "./preprocessing"
import { initializeViewer, swapSimulationMesh } from "./viewer"

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location)

    // TODO: Dynamically call this when sliders are moved instead of re-downloading everything
    const geometries = processGeometries(buildingGeometries)
    for (let k of Object.keys(geometries)) {
      console.log(k, geometries[k])
    }
    const scene = new ShadingScene(
      parseFloat(location.lat),
      parseFloat(location.lon)
    )
    geometries.simulation.forEach((geom) => {
      scene.addSimulationGeometry(geom)
      scene.addShadingGeometry(geom)
    })
    geometries.surrounding.forEach((geom) => {
      scene.addShadingGeometry(geom)
    })

    initializeViewer(geometries, inputChanged)
    scene
      .calculate(
        window.numSimulations,
        "https://www.openpv.de/data/irradiance",
        0.22,
        1400 * 0.22
      )
      .then((simulationMesh) => {
        console.log("Simulation Mesh", simulationMesh)
        window.setLoading(false)
        console.log(simulationMesh)
        const material = new THREE.MeshLambertMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
        })
        simulationMesh.material = material
        simulationMesh.name = "simulationMesh"

        swapSimulationMesh(simulationMesh)
      })
  } else {
    window.setLoading(false)
    window.setShowThreeViewer(false)
    window.setShowErrorMessage(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
