import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createPVSystem } from '../Meshes/PVSystems'

const DrawPVControl = ({
  middle,
  setPVPoints,
  setPVSystems,
  setSelectedPVSystem,
  simulationMeshes,
  setFrontendState,
}) => {
  const { camera, gl, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const controls = useRef()
  let pvPointsRef = []

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
      if (intersection.object.type == 'Points') {
        // User clicked on a previously drawn point. Now we need
        // to check if this was the first point from the list
        // and if three points already exist. Then we can draw the
        // PV System.

        if (
          arePointsEqual(
            pvPointsRef[0].point,
            intersection.object.geometry.attributes.position.array,
          ) &&
          pvPointsRef.length > 2
        ) {
          createPVSystem({
            setPVSystems,
            setSelectedPVSystem,
            pvPoints: pvPointsRef,
            setPVPoints,
            simulationMeshes,
          })
          setFrontendState('Results')
        }
      }
      const point = intersection.point
      if (!intersection.face) {
        // Catch the error where sometimes the intersection
        // is undefined. By this no dot is drawn, but also
        // no error is thrown
        console.log('Intersection.face was null.')
        return undefined
      }
      const normal = intersection.face.normal
        .clone()
        .transformDirection(intersection.object.matrixWorld)

      setPVPoints((prevPoints) => {
        const newPoints = [...prevPoints, { point, normal }]
        pvPointsRef = newPoints // Keep ref updated
        return newPoints
      })
    }
  }

  useEffect(() => {
    // Add event listener
    gl.domElement.addEventListener('pointerdown', onPointerDown)

    // Clean up
    return () => {
      gl.domElement.removeEventListener('pointerdown', onPointerDown)
    }
  }, [gl])

  useFrame(() => {
    if (controls.current) controls.current.update()
  })

  return null // This component does not render anything visible
}

export default DrawPVControl

/**
 * Compares two points, where one is an object and one is a list.
 * The function allows a 1% deviation in each direction.
 * @param {} p1 First Point as object with x,y,z attribute
 * @param {} p2 Second point as list with three elements
 * @returns
 */
function arePointsEqual(p1, p2) {
  return Math.hypot(p1.x - p2[0], p1.y - p2[1], p1.z - p2[2]) < 0.01
}
