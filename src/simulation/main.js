import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { downloadBuildings } from "./download"
import { requestLocation } from "./location"
import { processGeometries } from "./preprocessing"

window.numSimulations = 5

export async function mainSimulation(
  inputValue,
  inputChanged,
  oldLocation,
  setGeometries
) {
  const location = await requestLocation(inputValue, inputChanged, oldLocation)
  window.setGeoLocation({ lat: location.lat, lon: location.lon })

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
    setGeometries(geometries)
    if (geometries.simulation.length == 0) {
      window.setFrontendState("ErrorAdress")
      return { simulationMesh: undefined, geometries: undefined }
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
    function loadingBarWrapperFunction(progress, total = 100) {
      console.log("Simulation Progress is ", progress)
      return window.setSimulationProgress(progress)
    }

    let simulationMesh = await scene.calculate(
      numSimulations,
      undefined,
      0.2,
      1400 * 0.2,
      loadingBarWrapperFunction
    )

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    })
    simulationMesh.material = material
    simulationMesh.name = "simulationMesh"
    return { simulationMesh, geometries }
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}

export async function simulationForNewBuilding(props) {
  console.log(props)
  // Get all geometries from the list and put it in one big simulation geometries. This needs
  // to be done since multiple buildings can be part of selectedMesh
  let simulationGeometries = mergeGeometries(
    props.selectedMesh.map((mesh) => mesh.geometry)
  )
  simulationGeometries.computeBoundingBox()
  simulationGeometries.computeBoundingSphere()
  let simulationCenter = new THREE.Vector3()
  simulationGeometries.boundingBox.getCenter(simulationCenter)

  const radius = simulationGeometries.boundingSphere.radius + 80
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
  console.log(geometries)
  const shadingScene = new ShadingScene(
    parseFloat(props.geoLocation.lat),
    parseFloat(props.geoLocation.lon)
  )
  console.log("latitude longitute", props.geoLocation)
  shadingScene.addSimulationGeometry(simulationGeometries)
  geometries.surrounding.forEach((geom) => {
    shadingScene.addShadingGeometry(geom)
  })

  let simulationMesh = await shadingScene.calculate(
    numSimulations,
    undefined,
    0.2,
    1400 * 0.2,
    (progress, total) => console.log("Simulation Progress is ", progress)
  )
  console.log("SimulationMesh", simulationMesh)
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  })
  simulationMesh.material = material
  simulationMesh.name = "simulationMesh"
  props.setDisplayedSimulationMesh([
    ...props.displayedSimulationMesh,
    simulationMesh,
  ])
  window.setDeletedSurroundingMeshes([
    ...props.deletedSurroundingMeshes,
    ...props.selectedMesh.map((obj) => obj.name),
  ])

  window.setDeletedBackgroundMeshes([
    ...props.deletedBackgroundMeshes,
    ...props.selectedMesh.map((obj) => obj.name),
  ])

  props.setSelectedMesh([])

  // Neuen Radius erstellen anhand von Radius Simulation Mesh plus Puffer
  // Alle Alten Geometries zusammenhauen
  // shadingGeometries anhand von neuem Radius, neuem Mittelpunkt und allen alten Geometries erstellen
  // simshady initialisieren und rechnen
  // Neue Simulation Meshes anzeigen
}
