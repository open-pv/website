// This is the only file where both functionality and GUI stuff is allowed

import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { downloadBuildings } from "./download"
import { setLocation } from "./location"
import { processGeometries } from "./preprocessing"
import { initializeViewer, simulationMesh, swapSimulationMesh } from "./viewer"

window.numSimulations = 80

export async function mainSimulation(
  inputValue,
  inputChanged,
  oldLocation,
  setGeometries
) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location)

    // TODO: Dynamically call this when sliders are moved instead of re-downloading everything
    let geometries = processGeometries(buildingGeometries)
    setGeometries(geometries)
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

    //initializeViewer(geometries, inputChanged)
    let numSimulations
    window.numSimulations
      ? (numSimulations = window.numSimulations)
      : (numSimulations = 80)
    let simulationMesh = await scene.calculate(
      numSimulations,
      undefined,
    )

    console.log("Simulation Mesh", simulationMesh)
    window.setIsLoading(false)
    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    })
    simulationMesh.material = material
    simulationMesh.name = "simulationMesh"
    // } else {
    // window.setIsLoading(false)
    // window.setShowThreeViewer(false)
    // window.setshowErrorNoGeometry(true)
    return { simulationMesh, geometries }
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
