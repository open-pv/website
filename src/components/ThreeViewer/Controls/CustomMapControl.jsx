import { OrbitControls } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import React, { useEffect, useRef } from "react"
import * as THREE from "three"

function CustomMapControl(props) {
  const controlsRef = useRef()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const { gl, camera, scene } = useThree()

  let lastTap = 0

  const handleInteraction = (event) => {
    event.preventDefault()

    const isTouch = event.type.startsWith("touch")
    const clientX = isTouch ? event.touches[0].clientX : event.clientX
    const clientY = isTouch ? event.touches[0].clientY : event.clientY

    const rect = event.target.getBoundingClientRect()
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = (-(clientY - rect.top) / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, camera)
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object
      console.log("Intersected Mesh", intersectedMesh)

      if (!intersectedMesh) return

      if (
        intersectedMesh.geometry.name &&
        (intersectedMesh.geometry.name.includes("surrounding") ||
          intersectedMesh.geometry.name.includes("background"))
      ) {
        const existingIndex = props.selectedMesh.findIndex(
          (mesh) => mesh.geometry.name === intersectedMesh.geometry.name
        )

        if (existingIndex > -1) {
          props.setSelectedMesh([
            ...props.selectedMesh.slice(0, existingIndex),
            ...props.selectedMesh.slice(existingIndex + 1),
          ])
        } else {
          props.setSelectedMesh([
            ...props.selectedMesh,
            {
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

  const handleDoubleClick = (event) => {
    handleInteraction(event)
  }

  const handleDoubleTap = (event) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTap
    if (tapLength < 300 && tapLength > 0) {
      handleInteraction(event)
    }
    lastTap = currentTime
  }

  useEffect(() => {
    const canvas = gl.domElement

    canvas.addEventListener("dblclick", handleDoubleClick)
    canvas.addEventListener("touchstart", handleDoubleTap)

    return () => {
      canvas.removeEventListener("dblclick", handleDoubleClick)
      canvas.removeEventListener("touchstart", handleDoubleTap)
    }
  }, [camera, scene])

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      target={props.middle}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      screenSpacePanning={false}
      maxPolarAngle={Math.PI / 2}
    />
  )
}

export default CustomMapControl
