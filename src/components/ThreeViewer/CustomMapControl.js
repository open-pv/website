import React, { useEffect, useRef } from "react"
import { extend, useFrame, useThree } from "react-three-fiber"
import * as THREE from "three"

import { MapControls } from "three/examples/jsm/Addons.js"

extend({ MapControls })

function onRightClick(event) {
  event.preventDefault()
  const elem = document.getElementsByClassName("three-viewer")[0]
  const rect = elem.getBoundingClientRect()

  const mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    const intersect = intersects[0]
    const intersectPoint = intersect.point.clone()

    // Calculate the offset between the camera and the intersection point
    const offset = new THREE.Vector3().subVectors(
      camera.position,
      controls.target
    )

    // Store the start and end positions for interpolation
    startTarget = controls.target.clone()
    endTarget = intersectPoint
    startPosition = camera.position.clone()
    endPosition = intersectPoint.clone().add(offset)

    // Start the transition
    isTransitioning = true
    transitionStartTime = performance.now()
  }
}

function CustomMapControl(props) {
  const controls = useRef()

  const { camera, gl } = useThree()
  camera.far = 10000
  camera.position.set(props.middle.x, props.middle.y, props.middle.z)
  const offset = new THREE.Vector3(0, -40, 80)
  camera.position.add(offset)
  camera.lookAt(props.middle)
  camera.up = new THREE.Vector3(0, 0, 1)
  //gl.domElement.addEventListener("contextmenu", onRightClick, false)
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
    //controls.current.target = props.middle
  })
  let returnVal = (
    <mapControls ref={controls} args={[camera, gl.domElement]} {...props} />
  )
  console.log(returnVal)
  return returnVal
}

export default CustomMapControl
