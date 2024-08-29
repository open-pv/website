import proj4 from 'proj4';
import * as THREE from 'three';


function processVegetationHeightmapData(vegetationData) {
  // Define projections
  proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
  proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs");

  // Function to convert UTM32 to Web Mercator (EPSG:3857)
  const utm32ToWebMercator = proj4("EPSG:25832", "EPSG:3857");

  // Find bounding box of all raster patches in UTM32
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  vegetationData.forEach(([filename, rasterData]) => {
    const [x, y] = extractCoordinatesFromFilename(filename);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + 1000); // Assuming 1km x 1km tiles
    maxY = Math.max(maxY, y + 1000);
  });

  // Create 2D array for merged raster in UTM32 coordinates
  const utmWidth = maxX - minX;
  const utmHeight = maxY - minY;
  const utmRaster = Array(utmHeight).fill().map(() => Array(utmWidth).fill(NaN));

  // Stitch patches in UTM32
  vegetationData.forEach(([filename, rasterData]) => {
    const [x, y] = extractCoordinatesFromFilename(filename);
    const tileWidth = Math.sqrt(rasterData[0].length); // Assuming square tiles
    for (let i = 0; i < tileWidth; i++) {
      for (let j = 0; j < tileWidth; j++) {
        const utmX = Math.floor(x + j * (1000 / tileWidth) - minX);
        const utmY = Math.floor(maxY - (y + i * (1000 / tileWidth)));
        if (utmX >= 0 && utmX < utmWidth && utmY >= 0 && utmY < utmHeight) {
          utmRaster[utmY][utmX] = rasterData[0][i * tileWidth + j];
        }
      }
    }
  });

  // Convert bounding box to Web Mercator
  const [minMercX, minMercY] = utm32ToWebMercator.forward([minX, minY]);
  const [maxMercX, maxMercY] = utm32ToWebMercator.forward([maxX, maxY]);

  // Calculate dimensions in Web Mercator
  const mercWidth = Math.ceil(maxMercX - minMercX);
  const mercHeight = Math.ceil(maxMercY - minMercY);

  // Create 2D array for merged raster in Web Mercator coordinates
  const mergedRaster = Array(mercHeight).fill().map(() => Array(mercWidth).fill(NaN));

  // Transform and interpolate to 1x1m resolution in Web Mercator
  for (let mercY = 0; mercY < mercHeight; mercY++) {
    for (let mercX = 0; mercX < mercWidth; mercX++) {
      const [utmX, utmY] = proj4("EPSG:3857", "EPSG:25832").forward([minMercX + mercX, maxMercY - mercY]);
      const utmIndexX = Math.floor(utmX - minX);
      const utmIndexY = Math.floor(maxY - utmY);

      if (utmIndexX >= 0 && utmIndexX < utmWidth && utmIndexY >= 0 && utmIndexY < utmHeight) {
        // Bilinear interpolation
        const x0 = Math.floor(utmIndexX);
        const x1 = Math.min(x0 + 1, utmWidth - 1);
        const y0 = Math.floor(utmIndexY);
        const y1 = Math.min(y0 + 1, utmHeight - 1);

        const q11 = utmRaster[y0][x0];
        const q21 = utmRaster[y0][x1];
        const q12 = utmRaster[y1][x0];
        const q22 = utmRaster[y1][x1];

        const x = utmIndexX - x0;
        const y = utmIndexY - y0;

        const value = (1 - x) * (1 - y) * q11 + x * (1 - y) * q21 + (1 - x) * y * q12 + x * y * q22;
        mergedRaster[mercY][mercX] = value; // Replace NaN with 0 or another suitable value
      }
    }
  }

  return {
    data: mergedRaster,
    minX: minMercX,
    minY: minMercY,
    maxX: maxMercX,
    maxY: maxMercY,
    width: mercWidth,
    height: mercHeight,
    getHeight: function(x, y) {
      const indexX = Math.floor(x - this.minX);
      const indexY = Math.floor(this.maxY - y); // Flip Y-axis
      if (indexX >= 0 && indexX < this.width && indexY >= 0 && indexY < this.height) {
        return this.data[indexY][indexX];
      }
      return 0; // Return 0 for out-of-bounds or NaN values
    }
  };
}

function extractCoordinatesFromFilename(filename) {
  const [x, y] = filename.split('.')[0].split('_').map(Number);
  return [x * 1000, y * 1000]; // Convert km to meters
}


function processVegetationData(vegetationRaster, simulationCenter, shadingCutoff) {
  const { data, minX, minY, maxX, maxY, width, height } = vegetationRaster;
  
  // Convert simulationCenter to local coordinates
  const centerX = simulationCenter.x - minX;
  const centerY = maxY - simulationCenter.y; // Flip Y-axis
  
  const cutoff2 = shadingCutoff * shadingCutoff;
  let simulation = [];
  let surrounding = [];
  let background = [];
  
  // Size of each cell in meters
  const cellSizeX = (maxX - minX) / width;
  const cellSizeY = (maxY - minY) / height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const height = data[y][x];
      if (isNaN(height) || height <= 0) continue; // Skip non-vegetation or invalid data
      
      // Calculate center of this cell in local coordinates
      const localX = (x + 0.5) * cellSizeX - centerX;
      const localY = (y + 0.5) * cellSizeY - centerY;
      
      // Calculate distance from simulation center
      const distanceSquared = localX * localX + localY * localY;
      
      // Create a simple geometry for this vegetation cell
      const geometry = createVegetationGeometry(cellSizeX, cellSizeY, height);
      geometry.translate(localX, localY, 0);
      
      if (distanceSquared <= cutoff2) {
        simulation.push(geometry);
      } else if (distanceSquared <= 4 * cutoff2) { // Extend surrounding area
        surrounding.push(geometry);
      } else {
        background.push(geometry);
      }
    }
  }
  
  return { simulation, surrounding, background };
}

function createVegetationGeometry(width, height, vegHeight) {
  // Create a simple box geometry to represent vegetation
  const geometry = new THREE.BoxGeometry(width, height, vegHeight);
  geometry.translate(0, 0, vegHeight / 2); // Move base to z=0
  return geometry;
}

export { processVegetationData, processVegetationHeightmapData };

