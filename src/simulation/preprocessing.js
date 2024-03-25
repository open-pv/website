import { vec3 } from "gl-matrix"
import * as THREE from "three"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"
import { coordinatesUTM32 } from "./location"


export function processGeometries(stlStrings) {
    let geometries = []

    for(let stlData of stlStrings) {
        let geometry = new STLLoader().parse(stlData)

        // Create and display the combined mesh
        const comment = getCommentLine(stlData)
        var local_offset = parseCommentLine(comment)
        geometry.translate(
            local_offset[0] - coordinatesUTM32[0],
            local_offset[1] - coordinatesUTM32[1],
            local_offset[2]
        )
    
        geometries.push(geometry)
    }
  
    const combinedGeometries = BufferGeometryUtils.mergeGeometries(geometries);

    const simulationCutoff = window.numRadiusSimulation + 20;
    const shadingCutoff = window.numRadiusSimulation + 70;
    
    let [simulationGeometry, surroundingGeometry] = partitionMesh(combinedGeometries, simulationCutoff, shadingCutoff);

    return { simulationGeometry, surroundingGeometry };
}

function partitionMesh(geometry, innerCutoff, outerCutoff) {
    let posarray = geometry.attributes.position.array.slice()
    let innerPos = []
    let innerNormals = []
    let outerPos = []
    let outerNormals = []

    const innerR2 = innerCutoff * innerCutoff;
    const outerR2 = outerCutoff * outerCutoff;
    for (let i = 0; i < posarray.length; i += 9) {
        let zone = 'inner';
        for (let j = 0; j < 9; j += 3) {
            const x = posarray[i + j];
            const y = posarray[i + j + 1];
            if (x*x + y*y > outerR2) {
                zone = 'discard';
            } else if (x*x + y*y > innerR2) {
                zone = 'outer';
            }
        }

        if (zone !== 'discard') {
            const v0 = vec3.fromValues(...posarray.slice(i, i + 3))
            const v1 = vec3.fromValues(...posarray.slice(i + 3, i + 6))
            const v2 = vec3.fromValues(...posarray.slice(i + 6, i + 9))
            let d1 = vec3.create()
            vec3.sub(d1, v1, v0)
            let d2 = vec3.create()
            vec3.sub(d2, v2, v0)
            let ar = vec3.create()
            vec3.cross(ar, d1, d2)
            let normal = vec3.create()
            vec3.scale(normal, ar, 1 / vec3.len(ar))

            if (zone == 'inner') {
                for (var j = 0; j < 9; j++) {
                    innerPos.push(posarray[i + j])
                    innerNormals.push(normal[j % 3])
                }
            } else if (zone == 'outer') {
                for (var j = 0; j < 9; j++) {
                    outerPos.push(posarray[i + j])
                    outerNormals.push(normal[j % 3])
                }
            }
        }
    }

    let innerGeometry = new THREE.BufferGeometry()
    innerGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(innerPos), 3)
    )
    innerGeometry.setAttribute(
        "normal",
        new THREE.BufferAttribute(new Float32Array(innerNormals), 3)
    )
    innerGeometry.attributes.position.needsUpdate = true
    innerGeometry.attributes.normal.needsUpdate = true

    let outerGeometry = new THREE.BufferGeometry()
    outerGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(outerPos), 3)
    )
    outerGeometry.setAttribute(
        "normal",
        new THREE.BufferAttribute(new Float32Array(outerNormals), 3)
    )
    outerGeometry.attributes.position.needsUpdate = true
    outerGeometry.attributes.normal.needsUpdate = true

    return [innerGeometry, outerGeometry]
}

function getCommentLine(stlData) {
    // TODO: Do not refactor this, as we do not want to communicate the offet
    // over an stl comment in the future

    // Convert the ArrayBuffer to a Uint8Array
    var uint8Array = new Uint8Array(stlData)

    // Create an empty array to store the characters
    var commentChars = []

    // Iterate over the Uint8Array in reverse order
    for (var i = uint8Array.length - 2; i >= 0; i--) {
        // Check if the current character is a newline character
        if (uint8Array[i] === 10 || uint8Array[i] === 13) {
        // Stop iterating if a newline character is encountered
        break
        }

        // Add the current character to the commentChars array
        commentChars.unshift(String.fromCharCode(uint8Array[i]))
    }

    // Convert the array of characters to a string
    var commentLine = commentChars.join("")

    // Remove any leading or trailing whitespace
    commentLine = commentLine.trim()
    return commentLine
}

function parseCommentLine(comment) {
// Regular expression pattern to match the comment line format
var pattern =
    /^;\s*offset\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*$/i

// Match the comment line against the pattern
var match = comment.match(pattern)

var offset = [0, 0, 0]
// Check if the comment line matches the expected format
if (match) {
    // Extract the offsets from the matched groups
    console.log("Matches", match)
    offset = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]

    // Print the offsets
    console.log("Offsets:", offset[0], offset[1], offset[2])
} else {
    console.log("Invalid comment format")
}
return offset
}
