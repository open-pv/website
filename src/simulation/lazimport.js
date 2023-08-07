import { createLazPerf } from "laz-perf"

export function parseHeader(arrayBuffer) {
  if (arrayBuffer.byteLength < 227)
    throw new Error("Invalid arrayBuffer length")

  const dataView = new DataView(arrayBuffer)

  const pointDataRecordFormat = dataView.getUint8(104) & 0b1111
  const pointDataRecordLength = dataView.getUint16(105, true)
  const pointDataOffset = dataView.getUint32(96, true)
  const pointCount = dataView.getUint32(107, true)

  const scale = [
    dataView.getFloat64(131, true),
    dataView.getFloat64(139, true),
    dataView.getFloat64(147, true),
  ]
  const offset = [
    dataView.getFloat64(155, true),
    dataView.getFloat64(163, true),
    dataView.getFloat64(171, true),
  ]
  const min = [
    dataView.getFloat64(187, true),
    dataView.getFloat64(203, true),
    dataView.getFloat64(219, true),
  ]
  const max = [
    dataView.getFloat64(179, true),
    dataView.getFloat64(195, true),
    dataView.getFloat64(211, true),
  ]
  return {
    pointDataRecordFormat,
    pointDataRecordLength,
    pointDataOffset,
    pointCount,
    scale,
    offset,
    min,
    max,
  }
}

// suggested by ChatGPT
function getInt32(buffer, byteOffset, littleEndian) {
  const bytes = [
    buffer[byteOffset],
    buffer[byteOffset + 1],
    buffer[byteOffset + 2],
    buffer[byteOffset + 3],
  ]

  if (!littleEndian) {
    bytes.reverse()
  }

  const sign = bytes[3] & 0x80 ? -1 : 1
  const value =
    ((bytes[3] & 0x7f) << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0]

  return sign * value
}

export async function loadLAZ(radius, offsetPos, filenames) {
  console.log("LOADING!!!")
  const BUFFERED_POINTS_COUNT = 400000
  let points = new Float32Array(3 * BUFFERED_POINTS_COUNT) // 1000 points * 3 values per point
  let pointsIdx = 0

  for (var filename of filenames) {
    var filenameIdx
    if (window.lazFiles != null) {
      filenameIdx = window.lazFiles.indexOf(filename)
    } else {
      filenameIdx = -1
    }
    var arrayBuffer
    if (filenameIdx != -1) {
      arrayBuffer = window.lazCache[filenameIdx]
    } else {
      const response = await fetch(`https://www.openpv.de/laser/${filename}`)
      arrayBuffer = await response.arrayBuffer()
      if (window.lazFiles == null) {
        window.lazFiles = []
        window.lazCache = []
      }
      window.lazFiles.push(filename)
      window.lazCache.push(arrayBuffer)
    }
    const fileUint8Array = new Uint8Array(arrayBuffer)

    const {
      pointDataRecordFormat,
      pointDataRecordLength,
      pointDataOffset,
      pointCount,
      scale,
      offset,
      min,
      max,
    } = parseHeader(arrayBuffer)

    console.log("Total Point Count: ", pointCount)

    // Create our Emscripten module.
    const LazPerf = await createLazPerf()
    const laszip = new LazPerf.LASZip()

    // Allocate our memory in the Emscripten heap: a filePtr buffer for our
    // compressed content and a single point's worth of bytes for our output.
    const dataPtr = LazPerf._malloc(pointDataRecordLength)
    const filePtr = LazPerf._malloc(fileUint8Array.byteLength)

    // Copy our data into the Emscripten heap so we can point at it in getPoint().
    LazPerf.HEAPU8.set(fileUint8Array, filePtr)

    min[0] -= offsetPos[0]
    max[0] -= offsetPos[0]
    min[1] -= offsetPos[1]
    max[1] -= offsetPos[1]
    min[2] -= offsetPos[2]
    max[2] -= offsetPos[2]

    console.log("Mesh minmax", min, max)
    console.log("Offset Pos", offsetPos)

    const pointbuffer = new Uint8Array(
      LazPerf.HEAPU8.buffer,
      LazPerf.HEAPU8.byteOffset,
      pointDataRecordLength
    )
    const dataview = new DataView(
      pointbuffer.buffer,
      pointbuffer.byteOffset,
      pointDataRecordLength
    )

    console.time("LoadingTime")

    try {
      laszip.open(filePtr, fileUint8Array.byteLength)

      const heapByteOffset = LazPerf.HEAPU8.byteOffset

      for (let i = 0; i < pointCount; ++i) {
        laszip.getPoint(dataPtr)

        // Directly access the LazPerf.HEAPU8 buffer without creating intermediary pointbuffer or dataview
        const baseOffset = heapByteOffset + dataPtr

        // Retrieve values directly from the buffer
        const x =
          getInt32(LazPerf.HEAPU8, baseOffset, true) * scale[0] +
          offset[0] -
          offsetPos[0]
        const y =
          getInt32(LazPerf.HEAPU8, baseOffset + 4, true) * scale[1] +
          offset[1] -
          offsetPos[1]
        const z =
          getInt32(LazPerf.HEAPU8, baseOffset + 8, true) * scale[2] +
          offset[2] -
          offsetPos[2]

        if (x > -radius && x < radius && y > -radius && y < radius) {
          if (pointsIdx >= points.length) {
            const newPoints = new Float32Array(points.length * 2) // Double the size
            newPoints.set(points)
            points = newPoints
          }
          points[pointsIdx++] = x
          points[pointsIdx++] = y
          points[pointsIdx++] = z
        }
      }
    } finally {
      LazPerf._free(filePtr)
      LazPerf._free(dataPtr)
      laszip.delete()
    }
    console.timeEnd("LoadingTime")
  }
  // points.length = pointsIdx;
  console.log("Points loaded", pointsIdx / 3)
  points = points.subarray(0, pointsIdx)
  return points
}
