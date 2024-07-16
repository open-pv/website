// This is the only file where both functionality and GUI stuff is allowed

import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { downloadBuildings } from "./download"
import { setLocation } from "./location"
import { processGeometries } from "./preprocessing"
import { initializeViewer, swapSimulationMesh } from "./viewer"

window.numSimulations = 80

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  // Clear previous attributions if any
  if(window.setAttribution) {
    for(let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false);
    }
  }

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location)

    // TODO: Dynamically call this when sliders are moved instead of re-downloading everything
    const geometries = processGeometries(buildingGeometries)
    if (geometries.simulation.length == 0) {
      window.setshowErrorNoGeometry(true)
      return
    }
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
    let numSimulations
    window.numSimulations
      ? (numSimulations = window.numSimulations)
      : (numSimulations = 80)
    scene
      .calculate(
        numSimulations,
        "https://www.openpv.de/data/irradiance",
        0.22,
        1400 * 0.22
      )
      .then((simulationMesh) => {
        console.log("Simulation Mesh", simulationMesh)
        window.setIsLoading(false)
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
    window.setIsLoading(false)
    window.setShowThreeViewer(false)
    window.setshowErrorNoGeometry(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
