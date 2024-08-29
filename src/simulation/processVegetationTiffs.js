import proj4 from 'proj4';
import * as THREE from 'three';

function processVegetationHeightmapData(vegetationData) {
  // Define projections
  proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
  proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs");

  // Function to convert UTM32 to Web Mercator (EPSG:3857)
  const utm32ToWebMercator = proj4("EPSG:25832", "EPSG:3857");

  // Find bounding box of all raster patches
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  vegetationData.forEach(([filename, rasterData]) => {
    const [x, y] = extractCoordinatesFromFilename(filename);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + 1000); // Assuming 1km x 1km tiles
    maxY = Math.max(maxY, y + 1000);
  });   

  // Create a merged raster with 1m resolution
  const width = maxX - minX;
  const height = maxY - minY;
  const mergedRaster = new Float32Array(width * height).fill(NaN);

  // Merge raster data
  vegetationData.forEach(([filename, rasterData]) => {
    const [x, y] = extractCoordinatesFromFilename(filename);
    const offsetX = x - minX;
    const offsetY = y - minY;
    
    for (let i = 0; i < 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        const value = rasterData[0][i * 1000 + j];
        if (!isNaN(value)) {
          mergedRaster[(offsetY + i) * width + (offsetX + j)] = value;
        }
      }
    }
  });

  // Convert merged raster to Web Mercator coordinates
  const mercatorPoints = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = mergedRaster[y * width + x];
      if (!isNaN(value)) {
        const [mercX, mercY] = utm32ToWebMercator.forward([minX + x, minY + y]);
        mercatorPoints.push(new THREE.Vector3(mercX, mercY, value));
      }
    }
  }

  // Calculate the center point in Web Mercator coordinates
  const [centerX, centerY] = utm32ToWebMercator.forward([
    (minX + maxX) / 2,
    (minY + maxY) / 2
  ]);
  const centerPoint = new THREE.Vector3(centerX, centerY, 0);

  // Adjust points relative to the center
  const adjustedPoints = mercatorPoints.map(point => point.sub(centerPoint));

  return adjustedPoints;
}

function extractCoordinatesFromFilename(filename) {
  const [x, y] = filename.split('.')[0].split('_').map(Number);
  return [x * 1000, y * 1000]; // Convert km to meters
}

export { processVegetationHeightmapData };
