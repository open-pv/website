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

    return { simulationMesh }
  }
}

export async function simulationForNewBuilding(props) {
  console.log("props", props)
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

  console.log("Selected Mesh in simulationForNewBuilding", props.selectedMesh)
  console.log(
    "Surrounding List in simulationForNewBuilding",
    props.geometries.surrounding
  )
  console.log(props.geometries.simulation)
  const selectedMeshNames = props.selectedMesh.map((mesh) => mesh.geometry.name)

  const updatedSurroundings = props.geometries.surrounding.filter(
    (mesh) => !selectedMeshNames.includes(mesh.name)
  )
  const updatedBackground = props.geometries.background.filter(
    (mesh) => !selectedMeshNames.includes(mesh.name)
  )

  // get the lowest available index from simulation geometries
  const existingSimulationNames = props.geometries.simulation.map(
    (mesh) => mesh.name
  )
  let index = 0
  while (existingSimulationNames.includes(`simulation-${index}`)) {
    index++
  }

  const renamedSelectedMeshes = props.selectedMesh.map((mesh) => {
    mesh.geometry.name = `simulation-${index++}`
    return mesh.geometry
  })

  const updatedSimulation = [
    ...props.geometries.simulation,
    ...renamedSelectedMeshes,
  ]

  window.setGeometries({
    surrounding: updatedSurroundings,
    background: updatedBackground,
    simulation: updatedSimulation,
  })

  console.log("updated simulation", updatedSimulation)

  props.setSelectedMesh([])
}
