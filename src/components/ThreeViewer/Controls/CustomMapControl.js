import React, { useEffect, useRef } from "react"
import { extend, useFrame, useThree } from "react-three-fiber"
import * as THREE from "three"

import { MapControls } from "three/examples/jsm/Addons.js"

extend({ MapControls })

function CustomMapControl(props) {
  const controls = useRef()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  const { gl, camera, scene } = useThree()

  const handleDoubleClick = (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    const rect = event.target.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, camera)

    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object
      if (!intersectedMesh) return
      if (
        intersectedMesh.name &&
        intersectedMesh.name.includes("SurroundingMesh")
      ) {
        const existingIndex = props.selectedMesh.findIndex(
          (mesh) => mesh.name === intersectedMesh.name
        )
        if (existingIndex > -1) {
          // Remove the mesh from the list if it already exists
          props.setSelectedMesh([
            ...props.selectedMesh.slice(0, existingIndex),
            ...props.selectedMesh.slice(existingIndex + 1),
          ])
        } else {
          // Add the mesh to the list if it does not exist
          props.setSelectedMesh([
            ...props.selectedMesh,
            {
              name: intersectedMesh.name,
              geometry: intersectedMesh.geometry,
              material: intersectedMesh.material,
            },
          ])
        }
      }
    } else {
      console.log("No children in the intersected mesh.")
    }
  }

  useEffect(() => {
    if (controls.current) {
      controls.current.target = props.middle // Set your desired target
      controls.current.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }

      controls.current.screenSpacePanning = false
      controls.current.maxPolarAngle = Math.PI / 2
      controls.current.update()
    }
  }, [])

  useFrame(() => {
    controls.current.update()
  })

  useEffect(() => {
    // Add the event listener
    window.addEventListener("dblclick", handleDoubleClick)

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("dblclick", handleDoubleClick)
    }
  }, [camera, scene])
  window.addEventListener("dblclick", handleDoubleClick)

  return (
    <mapControls ref={controls} args={[camera, gl.domElement]} {...props} />
  )
}

export default CustomMapControl
