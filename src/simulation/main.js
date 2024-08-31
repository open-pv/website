import ShadingScene from "@openpv/simshady"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { downloadBuildings, downloadVegetationHeightmap } from "./download"
import { coordinatesWebMercator } from './location'
import { processGeometries } from "./preprocessing"

import {
  processVegetationData,
  processVegetationHeightmapData,
} from "./processVegetationTiffs"

export async function mainSimulation(location, setGeometries) {
  // Clear previous attributions if any
  if (window.setAttribution) {
    for (let attributionSetter of Object.values(window.setAttribution)) {
      attributionSetter(false)
    }
  }

  if (typeof location !== "undefined" && location != null) {
    const buildingGeometries = await downloadBuildings(location)
    //const vegetationData = await retrieveVegetationRasters(location)

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


    const [cx, cy] = coordinatesWebMercator;
    console.log("coordinatesWebMercator:"+coordinatesWebMercator)
    const bufferDistance = 1000; // 1km buffer, adjust as needed
    const bbox = [
      cx - bufferDistance,
      cy - bufferDistance,
      cx + bufferDistance,
      cy + bufferDistance
    ];
  
    console.log("Starting vegetation processing...");
    console.log(`Bounding box for vegetation data: [${bbox.join(', ')}]`);
  
    try {
      console.log("Downloading vegetation heightmap data...");
      const vegetationHeightmapData = await downloadVegetationHeightmap(bbox);
      
      if (!vegetationHeightmapData) {
        throw new Error("Failed to download vegetation heightmap data");
      }
      
      console.log("Vegetation Heightmap Data downloaded successfully");
      console.log(`Data dimensions: ${vegetationHeightmapData.width}x${vegetationHeightmapData.height}`);
      console.log(`Data bounding box: [${vegetationHeightmapData.bbox.join(', ')}]`);
  
      console.log("Processing vegetation raster data...");
      const vegetationRaster = processVegetationHeightmapData(vegetationHeightmapData);
      
      if (!vegetationRaster) {
        throw new Error("Failed to process vegetation raster data");
      }
      
      console.log("Vegetation Raster processed successfully");
  
      console.log("Processing vegetation geometries...");
      const vegetationGeometries = processVegetationData(
        vegetationRaster,
        new THREE.Vector3(0, 0, 0),
        30,
        300,
      );
      
      console.log("Vegetation Geometries processed successfully");
      console.log(`Number of surrounding geometries: ${vegetationGeometries.surrounding.length}`);
      console.log(`Number of background geometries: ${vegetationGeometries.background.length}`);
  
      window.setVegetationGeometries(vegetationGeometries);
  
      console.log("Adding vegetation geometries to the scene...");
      vegetationGeometries.surrounding.forEach((geom) => {
        //scene.addShadingGeometry(geom);
      });
      console.log("Vegetation geometries added to the scene");
  
    } catch (error) {
      console.error("Error in vegetation processing:", error);
      console.error("Error stack:", error.stack);
      // You might want to set an error state or display an error message to the user here
    }
  
    console.log("Vegetation processing completed");

  

    //vegetationGeometries.surrounding.forEach((geom) => {
    //  scene.addShadingGeometry(geom)
    //})
    //vegetationGeometries.surrounding.forEach((geom) => {
    //  scene.addShadingGeometry(geom)
    //})
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
