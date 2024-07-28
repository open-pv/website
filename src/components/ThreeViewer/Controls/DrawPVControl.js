import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
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
    controls.current.target = middle
    controls.current.mouseButtons = {
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
    if (event.button !== 0) return

    const rect = event.target.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, camera)

    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const intersection = intersects[0]

      const point = intersection.point
      const normal = intersection.face.normal
        .clone()
        .transformDirection(intersection.object.matrixWorld)
      console.log("point", point)
      console.log("normal", normal)

      setPVPoints((prevPoints) => [...prevPoints, { point, normal }])
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
