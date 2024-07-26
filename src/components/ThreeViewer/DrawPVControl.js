import { useFrame, useThree } from "@react-three/fiber"
import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const DrawPVControl = ({ middle, setPVPoints }) => {
  const { camera, gl, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const controls = useRef()

  useEffect(() => {
    // Initialize OrbitControls
    controls.current = new OrbitControls(camera, gl.domElement)
    controls.current.target = middle // Set your desired target
    controls.current.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    }
    controls.current.screenSpacePanning = false
    controls.current.maxPolarAngle = Math.PI / 2
    controls.current.update()

    // Clean up on unmount
    return () => {
      controls.current.dispose()
    }
  }, [camera, gl, middle])

  const onPointerDown = (event) => {
    if (event.button !== 0) return // Only respond to left-clicks

    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update the raycaster with the camera and mouse position
    raycaster.current.setFromCamera(mouse.current, camera)

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const intersection = intersects[0]

      const point = intersection.point
      console.log("point", point)
      setPVPoints((prevPoints) => [...prevPoints, point])
    }
  }

  useEffect(() => {
    // Add event listener
    gl.domElement.addEventListener("pointerdown", onPointerDown)

    // Clean up
    return () => {
      gl.domElement.removeEventListener("pointerdown", onPointerDown)
    }
  }, [gl])

  useFrame(() => {
    if (controls.current) controls.current.update()
  })

  return null // This component does not render anything visible
}

export default DrawPVControl
