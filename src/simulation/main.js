import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { downloadBuildings, retrieveDataVegetationTif } from "./download"
import { processGeometries } from "./preprocessing"
import { processVegetationHeightmapData } from "./processVegetationTiffs"

export async function mainSimulation(location, setGeometries) {
  // Clear previous attributions if any
  if (window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location)
    const vegetationData = await retrieveDataVegetationTif(location)

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



    // Process vegetation heightmap data
    console.log("Vegetation Data:");

    console.log(vegetationData);
    const { data,minX, minY, maxX, maxY, width, height } = processVegetationHeightmapData(vegetationData);
    console.log("Processed Vegetation Points:");

    console.log(data);
    //scene.addVegetationRaster(rasterData)



    let numSimulations = window.numSimulations || 80
    function loadingBarWrapperFunction(progress, total = 100) {
      // console.log("Simulation Progress is ", progress)
      return window.setSimulationProgress(progress)
    }

    let simulationMesh = await scene.calculate({
      numberSimulations: numSimulations,
      diffuseIrradianceURL: undefined,
      pvCellEfficiency: 0.2,
      maxYieldPerSquareMeter: 1400 * 0.2,
      progressCallback: loadingBarWrapperFunction,
    })

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    })
    simulationMesh.material = material
    simulationMesh.name = "simulationMesh"
    return { simulationMesh, geometries }
  }
}

export async function simulationForNewBuilding(props) {
  console.log(props)
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
  console.log("latitude longitude", props.geoLocation)
  shadingScene.addSimulationGeometry(simulationGeometries)
  geometries.surrounding.forEach((geom) => {
    shadingScene.addShadingGeometry(geom)
  })

  let numSimulations = window.numSimulations || 80

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
  props.setDisplayedSimulationMesh([
    ...props.displayedSimulationMesh,
    simulationMesh,
  ])
  window.setDeletedSurroundingMeshes([
    ...props.deletedSurroundingMeshes,
    ...props.selectedMesh.map((obj) => obj.name),
  ])

  props.setSelectedMesh([])
}