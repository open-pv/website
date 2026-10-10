#!/usr/bin/env node
// Regenerates public/coverage-mask.geojson from coverage-boundary GeoJSON files.
// The mask covers the whole world except the covered regions (the "holes"),
// which are where OpenPV has coverage data.
//
// Data: each covered region is a boundary file in scripts/data/coverage/.
// Germany uses the official BKG 1:250k border (via geoBoundaries,
// EEZ... Federal Agency for Cartography and Geodesy, data license
// "Germany – Attribution 2.0", govdata.de/dl-de/by-2-0). At ~65k vertices this
// is far finer than Natural Earth's coarsest 10m (~3k), so the border stays
// crisp when zoomed in.
//
//   node scripts/update-mask.mjs
//
// To cover more regions later, drop a boundary file into scripts/data/coverage/
// and add { name, file } to COVERED below.

import { buffer as turfBuffer } from '@turf/buffer'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
// jsts is a CJS package already in node_modules (a transitive dep); give it a
// require from this module's location so it resolves without a new dependency.
const require = createRequire(import.meta.url)
const jsts = require('jsts')
const geomReader = new jsts.io.GeoJSONReader()
const geomWriter = new jsts.io.GeoJSONWriter()
const IsValidOp = jsts.operation.valid.IsValidOp
const topologySimplify = jsts.simplify.TopologyPreservingSimplifier

// Covered regions. `file` is a GeoJSON file (one or more features) whose
// exterior rings become holes in the world mask. Prefer the finest-resolution
// boundary available (official/1:250k sources beat Natural Earth 10m).
const COVERED = [{ name: 'Germany', file: 'germany.geojson' }]

// TopologyPreservingSimplifier distance tolerance, in degrees (~0.005° ≈ 360m
// E-W / 555m N-S at German latitudes). The mask only renders as a dim fill that
// fades out below zoom 12 and a 1.5px border, so ~65k official border vertices
// are far more than the output needs. Lower = crisper but bigger; raise to
// shrink further. Unlike a plain RDP drop-points loop, this simplifier is
// guaranteed not to introduce self-intersections (RDP at 0.005 shipped an
// invalid mask: it let long chords cross back over the ring, which MapLibre
// rendered as moving shaded shards while zooming).
const SIMPLIFY_TOLERANCE = 0.005

// The clickable area (the mask hole) is inflated past the true border by this
// many meters. The official border is far finer than the simplification (which
// can eat up to ~555m near the border), so the shipped mask is slightly
// smaller than the real coverage and border buildings get unclickable. Buffering
// one simplification-tolerance's worth (~1km) past the border recovers them;
// the downstream "no data" check rejects the rare overshoot.
const BUFFER_METERS = 500

// Coordinates are truncated to this many decimals (~0.00001° ≈ 1m). The raw
// floats from JSON.parse carry ~15 significant digits; that precision is
// invisible on a map and roughly doubles the file size.
const COORD_DECIMALS = 5

const roundCoord = (v) => Number(v.toFixed(COORD_DECIMALS))

const WORLD = [
  [
    [-180, -90],
    [-180, 90],
    [180, 90],
    [180, -90],
    [-180, -90],
  ],
]

// GeoJSON → JTS geometry. The reader wraps the result; unwrap to the raw JTS
// geometry the simplifier and validity checker expect.
const toJts = (geojson) =>
  geomReader.read(geojson).geometry || geomReader.read(geojson)

const roundFeatureCoords = (geo) => {
  const roundRing = (r) => r.map(([x, y]) => [roundCoord(x), roundCoord(y)])
  if (geo.type === 'Polygon') geo.coordinates = geo.coordinates.map(roundRing)
  else if (geo.type === 'MultiPolygon')
    geo.coordinates = geo.coordinates.map((p) => p.map(roundRing))
  return geo
}

// The world shell as a JTS polygon, for the world-minus-covered subtraction.
const worldJts = toJts({
  type: 'Feature',
  properties: {},
  geometry: { type: 'Polygon', coordinates: WORLD },
})

// Subtract every covered (buffered) region from the world shell. We compute
// the mask as `world ∖ covered` with JTS geometry subtraction rather than
// hand-assembling "shell + exterior-ring holes": the 500m buffer inflates the
// full-detail border on both sides of sub-1km inlets until the banks touch,
// which makes naive hole rings overlap/nest (invalid). `difference` nodes all
// of that into a single valid, well-formed mask (verified: mask ∪ Germany
// tiles the world with zero gap/overlap).
let maskJts = worldJts
for (const { name, file } of COVERED) {
  let data = JSON.parse(
    readFileSync(path.join(ROOT, 'scripts/data/coverage', file), 'utf8'),
  )
  // Inflate the covered region so the mask hole is larger than the true border
  // (handles simplification shrinking the hole; see BUFFER_METERS).
  // Turf returns a FeatureCollection; take its single feature's geometry.
  data = turfBuffer(data, BUFFER_METERS, { units: 'meters' })
  data = data.type === 'FeatureCollection' ? data.features[0] : data
  const geo = roundFeatureCoords(data.geometry)
  maskJts = maskJts.difference(toJts({ type: 'Feature', geometry: geo }))
  console.log(`  ${name}: buffered, subtracted from world mask`)
}

// Simplify the whole mask with a topology-preserving simplifier. Unlike a
// plain RDP drop-points loop (which shipped an invalid mask by letting long
// chords cross back over a ring), this never introduces self-intersections.
maskJts = topologySimplify.simplify(maskJts, SIMPLIFY_TOLERANCE)

// The mask geometry as GeoJSON.
const maskGeo = geomWriter.write(maskJts)

const geojson = {
  type: 'FeatureCollection',
  crs: {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
  },
  features: [{ type: 'Feature', properties: {}, geometry: maskGeo }],
}

// Self-check: the mask must be geometrically valid (no self-intersecting or
// nested rings) so it never ships a mask that MapLibre renders as moving
// shards while zooming, and its rings must be flat and closed.
const coordinates =
  maskGeo.type === 'Polygon' ? maskGeo.coordinates : maskGeo.coordinates.flat()
const flat = coordinates.every(
  (r) => Array.isArray(r[0]) && typeof r[0][0] === 'number',
)
const closed = coordinates.every(
  (r) =>
    r.length >= 4 &&
    r[0][0] === r[r.length - 1][0] &&
    r[0][1] === r[r.length - 1][1],
)
const validationError = new IsValidOp(maskJts).getValidationError()
if (!flat || !closed || validationError) {
  console.error(
    'Generated mask is invalid:',
    validationError ? validationError.toString() : '',
    flat && closed ? '' : 'rings must be flat and closed',
  )
  process.exit(1)
}

const out = path.join(ROOT, 'public/coverage-mask.geojson')
// Minified (no whitespace) + simplified + truncated coords: this file ships to
// browsers, so it must stay lean. Browsers/CDN gzip it anyway.
const serialized = JSON.stringify(geojson)
// Guard against the exact problem this script was made to fix: an accidentally
// fat mask (no simplification / decimated coords) silently bouncing back to MBs.
if (serialized.length > 2 * 1024 * 1024) {
  console.error(
    `Generated mask is ${(serialized.length / 1e6).toFixed(1)}MB (>2MB). ` +
      'Raise SIMPLIFY_TOLERANCE or drop COORD_DECIMALS.',
  )
  process.exit(1)
}
writeFileSync(out, serialized)
console.log(`Wrote ${out}`)
const names = COVERED.map((c) => c.name).join(', ')
const maskRings = coordinates.length
const maskVerts = coordinates.reduce((n, r) => n + r.length, 0)
console.log(
  `Covered: ${names} → mask with ${maskRings} ring(s), ${maskVerts} mask vertices`,
)
