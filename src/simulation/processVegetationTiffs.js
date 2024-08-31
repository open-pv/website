import * as THREE from 'three';
import { coordinatesWebMercator } from './location';

export function processVegetationHeightmapData(heightmapData) {
  if (!heightmapData || !heightmapData.bbox || !heightmapData.data) {
    console.error("Invalid heightmap data, missing bbox or data");
    return null;
  }

  return {
    ...heightmapData,
    data: new Float32Array(heightmapData.data)
  };
}

export function processVegetationData(vegetationRaster, simulationCenter, vegetationSimulationCutoff, vegetationViewingCutoff) {
  console.log("Processing vegetation data...");
  console.log("Vegetation raster dimensions:", vegetationRaster.width, "x", vegetationRaster.height);
  console.log("Vegetation raster bbox:", vegetationRaster.bbox);

  const geometries = {
    surrounding: [],
    background: []
  };

  const [minX, minY, maxX, maxY] = vegetationRaster.bbox;
  const [cx, cy] = coordinatesWebMercator;

  // Calculate raster resolution
  const xResolution = (maxX - minX) / vegetationRaster.width;
  const yResolution = (maxY - minY) / vegetationRaster.height;

  const simulationCutoffSquared = vegetationSimulationCutoff * vegetationSimulationCutoff;
  const viewingCutoffSquared = vegetationViewingCutoff * vegetationViewingCutoff;

  for (let y = 0; y < vegetationRaster.height; y++) {
    for (let x = 0; x < vegetationRaster.width; x++) {
      const height = vegetationRaster.data[y * vegetationRaster.width + x];

      if (height > 0) {
        // Calculate world coordinates
        const worldX = minX + x * xResolution - cx;
        const worldY = maxY - y * yResolution - cy;  // Flip Y-axis

        const distanceSquared = worldX * worldX + worldY * worldY;

        if (distanceSquared <= viewingCutoffSquared) {
          const vegGeometry = createVegetationGeometry(worldX, worldY, height);

          if (distanceSquared <= simulationCutoffSquared) {
            geometries.surrounding.push(vegGeometry);
          } else {
            geometries.background.push(vegGeometry);
          }
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

  const geometry = new THREE.BoxGeometry(width, depth, vegHeight).toNonIndexed();
  geometry.translate(x, y, vegHeight / 2);

  return geometry;
}