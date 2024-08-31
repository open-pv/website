import * as THREE from 'three';
import { coordinatesWebMercator } from './location';

function processVegetationHeightmapData(heightmapData) {
  if (!heightmapData || !heightmapData.bbox || !heightmapData.data) {
    console.error("Invalid heightmap data, missing bbox or data");
    return null;
  }

  return {
    ...heightmapData,
    getHeight: function(x, y) {
      const indexX = Math.floor((x - this.bbox[0]) / this.xResolution);
      const indexY = Math.floor((this.bbox[3] - y) / this.yResolution);
      if (indexX >= 0 && indexX < this.width && indexY >= 0 && indexY < this.height) {
        return this.data[indexY * this.width + indexX];
      }
      return 0; // Return 0 for out-of-bounds or NaN values
    }
  };
}

function processVegetationData(vegetationRaster, simulationCenter, vegetationSimulationCutoff, vegetationViewingCutoff) {
  console.log("Processing vegetation data...");
  console.log("Vegetation raster dimensions:", vegetationRaster.width, "x", vegetationRaster.height);
  console.log("Vegetation raster bbox:", vegetationRaster.bbox);

  const geometries = {
    simulation: [],
    surrounding: [],
    background: []
  };

  const [minX, minY, maxX, maxY] = vegetationRaster.bbox;

  for (let y = 0; y < vegetationRaster.height; y++) {
    for (let x = 0; x < vegetationRaster.width; x++) {
      const worldX = minX + x * vegetationRaster.xResolution;
      const worldY = maxY - y * vegetationRaster.yResolution;
      const height = vegetationRaster.getHeight(worldX, worldY);

      if (height > 0) {
        const vegGeometry = createVegetationGeometry(worldX, worldY, height);
        
        const center = new THREE.Vector3();
        vegGeometry.computeBoundingBox();
        vegGeometry.boundingBox.getCenter(center);
        
        const d2 = 
          (center.x - simulationCenter.x) ** 2 +
          (center.y - simulationCenter.y) ** 2;
        
        if (d2 <= vegetationSimulationCutoff * vegetationSimulationCutoff) {
          geometries.surrounding.push(vegGeometry);
        } else if (d2 <= vegetationViewingCutoff * vegetationViewingCutoff) {
          geometries.background.push(vegGeometry);
        }
      }
    }
  }

  console.log("Vegetation processing complete.");
  console.log("Surrounding geometries:", geometries.surrounding.length);
  console.log("Background geometries:", geometries.background.length);

  return geometries;
}

function createVegetationGeometry(x, y, vegHeight) {
  const width = 1;
  const depth = 1;
  const [cx, cy] = coordinatesWebMercator;

  const geometry = new THREE.BoxGeometry(width, depth, 20).toNonIndexed();
  geometry.translate(
    x - cx,
    y - cy,
    (vegHeight - 10)
  );

  return geometry;
}

export { processVegetationData, processVegetationHeightmapData };
