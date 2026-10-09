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
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

// Covered regions. `file` is a GeoJSON file (one or more features) whose
// exterior rings become holes in the world mask. Prefer the finest-resolution
// boundary available (official/1:250k sources beat Natural Earth 10m).
const COVERED = [{ name: 'Germany', file: 'germany.geojson' }]

// RDP simplification tolerance, in degrees (~0.005° ≈ 360m E-W / 555m N-S at
// German latitudes). The mask only renders as a dim fill that fades out below
// zoom 12 and a 1.5px border, so ~65k official border vertices are far more
// than the output needs. Lower = crisper but bigger; raise to shrink further.
const SIMPLIFY_TOLERANCE = 0.005

// The clickable area (the mask hole) is inflated past the true border by this
// many meters. The official border is far finer than the RDP simplification
// (which can eat up to ~555m near the border), so the shipped mask is slightly
// smaller than the real coverage and border buildings get unclickable. Buffering
// one simplification-tolerance's worth (~1km) past the border recovers them;
// the downstream "no data" check rejects the rare overshoot.
const BUFFER_METERS = 500

// Coordinates are truncated to this many decimals (~0.00001° ≈ 1m). The raw
// floats from JSON.parse carry ~15 significant digits; that precision is
// invisible on a map and roughly doubles the file size.
const COORD_DECIMALS = 5

const roundCoord = (v) => Number(v.toFixed(COORD_DECIMALS))

// Ramer–Douglas–Peucker over a closed ring (the closing point is kept). Kept
// as plain recursion per segment, not the iterative stack, to stay readable;
// rings here are at most ~52k points so stack depth is fine.
function simplifyRing(ring, tolSq) {
  const keep = new Array(ring.length).fill(false)
  simplifySegment(ring, 0, ring.length - 1, tolSq, keep)
  keep[0] = true
  keep[ring.length - 1] = true
  const out = []
  for (let i = 0; i < ring.length; i++) if (keep[i]) out.push(ring[i])
  return out
}

function simplifySegment(ring, start, end, tolSq, keep) {
  if (end - start < 2) return
  let maxDistSq = 0
  let index = -1
  const [ax, ay] = ring[start]
  const [bx, by] = ring[end]
  const lenSq = (bx - ax) ** 2 + (by - ay) ** 2
  for (let i = start + 1; i < end; i++) {
    const [px, py] = ring[i]
    // Distance of (p) from the line through (a)-(b), squared, in degree space.
    let d
    if (lenSq === 0) {
      d = (px - ax) ** 2 + (py - ay) ** 2
    } else {
      const t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / lenSq
      const x = ax + t * (bx - ax)
      const y = ay + t * (by - ay)
      d = (px - x) ** 2 + (py - y) ** 2
    }
    if (d > maxDistSq) {
      maxDistSq = d
      index = i
    }
  }
  if (maxDistSq > tolSq) {
    keep[index] = true
    simplifySegment(ring, start, index, tolSq, keep)
    simplifySegment(ring, index, end, tolSq, keep)
  }
}

const WORLD = [
  [-180, -90],
  [-180, 90],
  [180, 90],
  [180, -90],
  [-180, -90],
]

// Holes in the mask are counterclockwise (POS) against a clockwise world
// shell (keeps winding consistent with the originally shipped file; maplibre
// fills by ring order regardless). Source rings are already POS where
// relevant, so only reverse NEG rings. Rings may or may not repeat their
// closing point, so only re-add it if missing.
function reorientAndClose(ring) {
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    area += x1 * y2 - x2 * y1
  }
  const ccw = area < 0 ? ring.slice().reverse() : ring // force counterclockwise (POS)
  const closed = ccw.slice()
  const first = ccw[0]
  const last = ccw[ccw.length - 1]
  if (!(first[0] === last[0] && first[1] === last[1])) closed.push(first)
  return closed
}

function featureRings(feature) {
  // Every exterior ring of a feature as a flat list of rings.
  const g = feature.geometry
  if (!g) return []
  if (g.type === 'Polygon') return g.coordinates
  if (g.type === 'MultiPolygon') return g.coordinates.flat()
  return []
}

const holes = []
let holeCount = 0
const tolSq = SIMPLIFY_TOLERANCE ** 2
for (const { name, file } of COVERED) {
  let data = JSON.parse(
    readFileSync(path.join(ROOT, 'scripts/data/coverage', file), 'utf8'),
  )
  // Inflate the covered region so the mask hole is larger than the true border
  // (handles RDP simplification shrinking the hole; see BUFFER_METERS).
  // Turf returns a FeatureCollection; take its single feature's rings.
  data = turfBuffer(data, BUFFER_METERS, { units: 'meters' })
  const buffered = data.type === 'FeatureCollection' ? data.features[0] : data
  for (const ring of featureRings(buffered)) {
    const rounded = ring.map(([x, y]) => [roundCoord(x), roundCoord(y)])
    const simplified = simplifyRing(ring, tolSq)
    // A ring that collapses below 4 points (tiny islet) is kept whole: it adds
    // ~no size and must stay a valid closed polygon.
    const chosen = simplified.length >= 4 ? simplified : rounded
    holes.push(
      reorientAndClose(chosen.map(([x, y]) => [roundCoord(x), roundCoord(y)])),
    )
    holeCount++
  }
  console.log(`  ${name}: buffered → ${holeCount} hole(s) so far`)
}

const geojson = {
  type: 'FeatureCollection',
  crs: {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
  },
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [WORLD, ...holes],
      },
    },
  ],
}

// Self-check: one shell + at least one hole, all rings flat and closed.
const rings = geojson.features[0].geometry.coordinates
const flat = rings.every(
  (r) => Array.isArray(r[0]) && typeof r[0][0] === 'number',
)
const closed = rings.every(
  (r) =>
    r.length >= 4 &&
    r[0][0] === r[r.length - 1][0] &&
    r[0][1] === r[r.length - 1][1],
)
if (rings.length < 2 || !flat || !closed) {
  console.error(
    'Generated mask is invalid: expected shell + holes, all rings flat and closed.',
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
const holeVerts = rings.slice(1).reduce((n, r) => n + r.length, 0)
console.log(
  `Covered: ${names} → ${rings.length - 1} hole(s), ${holeVerts} mask vertices`,
)
