import { createLazPerf } from "laz-perf";

export function parseHeader(arrayBuffer) {
  if (arrayBuffer.byteLength < 227)
    throw new Error("Invalid arrayBuffer length");

  const dataView = new DataView(arrayBuffer);

  const pointDataRecordFormat = dataView.getUint8(104) & 0b1111;
  const pointDataRecordLength = dataView.getUint16(105, true);
  const pointDataOffset = dataView.getUint32(96, true);
  const pointCount = dataView.getUint32(107, true);

  const scale = [
    dataView.getFloat64(131, true),
    dataView.getFloat64(139, true),
    dataView.getFloat64(147, true),
  ];
  const offset = [
    dataView.getFloat64(155, true),
    dataView.getFloat64(163, true),
    dataView.getFloat64(171, true),
  ];
  const min = [
    dataView.getFloat64(187, true),
    dataView.getFloat64(203, true),
    dataView.getFloat64(219, true),
  ];
  const max = [
    dataView.getFloat64(179, true),
    dataView.getFloat64(195, true),
    dataView.getFloat64(211, true),
  ];
  return {
    pointDataRecordFormat,
    pointDataRecordLength,
    pointDataOffset,
    pointCount,
    scale,
    offset,
    min,
    max,
  };
}

export async function loadLAZ(radius, offsetPos, filenames) {
  console.log("LOADING!!!");
  const BUFFERED_POINTS_COUNT = 20000;
  var points = []; // new Float32Array(BUFFERED_POINTS_COUNT * 3);
  var pointsIdx = 0;

  for (var filename of filenames) {
    var filenameIdx;
    if (window.lazFiles != null) {
      filenameIdx = window.lazFiles.indexOf(filename);
    } else {
      filenameIdx = -1;
    }
    var arrayBuffer;
    if (filenameIdx != -1) {
      arrayBuffer = window.lazCache[filenameIdx];
    } else {
      const response = await fetch(`https://www.openpv.de/laser/${filename}`);
      arrayBuffer = await response.arrayBuffer();
      if (window.lazFiles == null) {
        window.lazFiles = [];
        window.lazCache = [];
      }
      window.lazFiles.push(filename);
      window.lazCache.push(arrayBuffer);
    }
    const fileUint8Array = new Uint8Array(arrayBuffer);

    const {
      pointDataRecordFormat,
      pointDataRecordLength,
      pointDataOffset,
      pointCount,
      scale,
      offset,
      min,
      max,
    } = parseHeader(arrayBuffer);

    console.log("Total Point Count: ", pointCount);

    // Create our Emscripten module.
    const LazPerf = await createLazPerf();
    const laszip = new LazPerf.LASZip();

    // Allocate our memory in the Emscripten heap: a filePtr buffer for our
    // compressed content and a single point's worth of bytes for our output.
    const dataPtr = LazPerf._malloc(pointDataRecordLength);
    const filePtr = LazPerf._malloc(fileUint8Array.byteLength);

    // Copy our data into the Emscripten heap so we can point at it in getPoint().
    LazPerf.HEAPU8.set(fileUint8Array, filePtr);

    min[0] -= offsetPos[0];
    max[0] -= offsetPos[0];
    min[1] -= offsetPos[1];
    max[1] -= offsetPos[1];
    min[2] -= offsetPos[2];
    max[2] -= offsetPos[2];

    console.log("Mesh minmax", min, max);
    console.log("Offset Pos", offsetPos);

    const pointbuffer = new Uint8Array(
      LazPerf.HEAPU8.buffer,
      LazPerf.HEAPU8.byteOffset,
      pointDataRecordLength
    );
    const dataview = new DataView(
      pointbuffer.buffer,
      pointbuffer.byteOffset,
      pointDataRecordLength
    );

    try {
      laszip.open(filePtr, fileUint8Array.byteLength);

      for (let i = 0; i < pointCount; ++i) {
        laszip.getPoint(dataPtr);

        // // Create a new Uint8Array for each point
        // const pointbuffer = new Uint8Array(
        //   LazPerf.HEAPU8.buffer,
        //   LazPerf.HEAPU8.byteOffset + dataPtr,
        //   pointDataRecordLength
        // );

        // Create a new Uint8Array for each point
        const pointbuffer = new Uint8Array(
          LazPerf.HEAPU8.buffer,
          LazPerf.HEAPU8.byteOffset + dataPtr,
          pointDataRecordLength
        );

        // The dataview needs to be recreated since its properties are read-only
        const dataview = new DataView(
          pointbuffer.buffer,
          pointbuffer.byteOffset,
          pointbuffer.byteLength
        );

        // Grab the scaled/offsetPos XYZ values and reverse the scale/offsetPos to get
        // their absolute positions.  It would be possible to add checks for
        // attributes other than XYZ here - our pointbuffer contains an entire
        // point whose format corresponds to the pointDataRecordFormat above.
        const point = [
          dataview.getInt32(0, true),
          dataview.getInt32(4, true),
          dataview.getInt32(8, true),
        ].map((v, i) => v * scale[i] + offset[i] - offsetPos[i]);

        if (point.every((v, i) => (v > -radius && v < radius) || i == 2)) {
          // if (pointsIdx == points.length) {
          //   let new_points = new Float32Array(pointsIdx * 2);
          //   new_points.set(points);
          //   points = new_points;
          // } else {
          //   points.set(point, pointsIdx);
          //   pointsIdx += 3;
          // }
          points.push(point);
        }
      }
    } finally {
      LazPerf._free(filePtr);
      LazPerf._free(dataPtr);
      laszip.delete();
    }
  }
  // points.length = pointsIdx;
  console.log("Points loaded");
  return points;
}
