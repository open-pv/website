import React, { useRef } from "react"
import { extend, useFrame, useThree } from "react-three-fiber"
import * as THREE from "three"

import { MapControls } from "three/examples/jsm/Addons.js"

extend({ MapControls })

function CustomMapControl(props) {
  const controls = useRef()
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  }
  controls.screenSpacePanning = false
  controls.maxPolarAngle = Math.PI / 2
  const { camera, gl } = useThree()
  camera.position.set(props.middle.x, props.middle.y, props.middle.z)
  const offset = new THREE.Vector3(0, -40, 80)
  camera.position.add(offset)
  camera.lookAt(props.middle)
  controls.target = props.middle
  useFrame(() => {
    controls.current.update()
  })
  return (
    <mapControls ref={controls} args={[camera, gl.domElement]} {...props} />
  )
}

export default CustomMapControl
