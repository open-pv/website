import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { downloadBuildings } from "./download"
import { processGeometries } from "./preprocessing"

export async function mainSimulation(location) {
  // Clear previous attributions if any
  if (window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location)

    let geometries = processGeometries(
      buildingGeometries,
      new THREE.Vector3(0, 0, 0),
      80
    )

    window.setGeometries(geometries)
    if (geometries.simulation.length == 0) {
      window.setFrontendState("ErrorAdress")
      return { simulationMesh: undefined }
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

    let numSimulations
    window.numSimulations
      ? (numSimulations = window.numSimulations)
      : (numSimulations = 80)
    function loadingBarWrapperFunction(progress, total = 100) {
      // console.log("Simulation Progress is ", progress)
      return window.setSimulationProgress(progress)
    }

    const simulationMesh = await scene.calculate({
      numberSimulations: numSimulations,
      diffuseIrradianceURL: undefined,
      pvCellEfficiency: 0.2,
      maxYieldPerSquareMeter: 1400 * 0.2,
      progressCallback: loadingBarWrapperFunction,
    })

    let middle = new THREE.Vector3()
    simulationMesh.geometry.computeBoundingBox()
    simulationMesh.geometry.boundingBox.getCenter(middle)
    simulationMesh.middle = middle

    return { simulationMesh }
  }
}

export async function simulationForNewBuilding(props) {
  // Get all geometries from the list and put it in one big simulation geometries. This needs
  // to be done since multiple buildings can be part of selectedMesh
  let newSimulationGeometries = mergeGeometries(
    props.selectedMesh.map((mesh) => mesh.geometry)
  )

  newSimulationGeometries.computeBoundingBox()
  newSimulationGeometries.computeBoundingSphere()
  let simulationCenter = new THREE.Vector3()
  newSimulationGeometries.boundingBox.getCenter(simulationCenter)

  const radius = newSimulationGeometries.boundingSphere.radius + 80
  const allBuildingGeometries = [
    ...props.geometries.surrounding,
    ...props.geometries.background,
    ...props.geometries.simulation,
  ]
  const geometries = processGeometries(
    allBuildingGeometries,
    simulationCenter,
    radius
  )
  const shadingScene = new ShadingScene(
    parseFloat(props.geoLocation.lat),
    parseFloat(props.geoLocation.lon)
  )
  shadingScene.addSimulationGeometry(newSimulationGeometries)
  geometries.surrounding.forEach((geom) => {
    shadingScene.addShadingGeometry(geom)
  })

  let numSimulations
  window.numSimulations
    ? (numSimulations = window.numSimulations)
    : (numSimulations = 80)

  let simulationMesh = await shadingScene.calculate({
    numberSimulations: numSimulations,
    pvCellEfficiency: 0.2,
    maxYieldPerSquareMeter: 1400 * 0.2,
    progressCallback: (progress, total) =>
      console.log("Simulation Progress is ", progress),
  })
  console.log("SimulationMesh", simulationMesh)
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  })
  simulationMesh.material = material
  simulationMesh.name = "simulationMesh"

  props.setSimulationMeshes([...props.simulationMeshes, simulationMesh])
  /// Delete the new simualted building from the background / surrounding geometries list
  const selectedMeshNames = props.selectedMesh.map((mesh) => mesh.geometry.name)

  const updatedSurroundings = props.geometries.surrounding.filter(
    (mesh) => !selectedMeshNames.includes(mesh.name)
  )
  const updatedBackground = props.geometries.background.filter(
    (mesh) => !selectedMeshNames.includes(mesh.name)
  )

  window.setGeometries({
    surrounding: updatedSurroundings,
    background: updatedBackground,
  })

  props.setSelectedMesh([])
}
