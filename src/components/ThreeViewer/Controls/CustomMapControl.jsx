import { MapControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useContext, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SceneContext } from '../../context'

function CustomMapControl() {
  const sceneContext = useContext(SceneContext)
  const controlsRef = useRef()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const { gl, camera, scene } = useThree()

  /**
   * Returns the list of intersected objects. An intersected object is an object
   * that lies directly below the mouse cursor.
   */
  const getIntersects = (event) => {
    const isTouch = window.isTouchDevice
    const clientX = isTouch ? event.touches[0].clientX : event.clientX
    const clientY = isTouch ? event.touches[0].clientY : event.clientY

    const rect = event.target.getBoundingClientRect()
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = (-(clientY - rect.top) / rect.height) * 2 + 1

    raycaster.current.setFromCamera(mouse.current, camera)

    return raycaster.current.intersectObjects(scene.children, true)
  }

  /**
   * Filter out Sprites (ie the labels of PV systems).
   * Returns the first element of the intersects list that is not a sprite.
   */
  const ignoreSprites = (intersects) => {
    let i = 0
    while (i < intersects.length && intersects[i].object.type === 'Sprite') {
      i++
    }
    if (i === intersects.length) {
      console.log('Only Sprite objects found in intersections.')
      return
    }
    return intersects[i]
  }

  const handleMouseMove = (event) => {
    event.preventDefault()
    const intersects = getIntersects(event)
    const intersected = ignoreSprites(intersects)
    if (!intersected) return
    const intersectedFace = intersected.face
    const [slope, azimuth] = calculateSlopeAzimuthFromNormal(
      intersectedFace.normal,
    )
    sceneContext.setSlope(Math.round(slope))
    sceneContext.setAzimuth(Math.round(azimuth))
  }

  // Attach mouse move listener once
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('mousemove', handleMouseMove)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gl])

  // Update controls each frame
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  // -------------------------------------------------
  // Determine the initial target for the map controls.
  // This should happen only once, after the building data
  // has been loaded, and must not be overwritten by later
  // renders or user interactions.
  // -------------------------------------------------
  const initialTarget = useRef(new THREE.Vector3(0, 0, 0))
  const targetSet = useRef(false)

  // Run when building data changes. Set the target only the first time
  // we have a simulation building with a stored middle point.
  useEffect(() => {
    if (targetSet.current) return

    const firstSimBuilding = sceneContext.buildings?.find(
      (b) => b.type === 'simulation',
    )
    if (
      firstSimBuilding &&
      firstSimBuilding.simulationMiddle
    ) {
      const m = firstSimBuilding.simulationMiddle
      initialTarget.current.set(m.x, m.y, m.z)

      // If the controls already exist, update its internal target immediately.
      if (controlsRef.current) {
        controlsRef.current.target.copy(initialTarget.current)
        controlsRef.current.update()
      }

      targetSet.current = true
    }
  }, [sceneContext.buildings])

  return (
    <MapControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      target={initialTarget.current}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      touches={{
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
      screenSpacePanning={false}
      dampingFactor={1}
      maxPolarAngle={Math.PI / 2}
    />
  )
}

export default CustomMapControl

const calculateSlopeAzimuthFromNormal = (normal) => {
  const up = new THREE.Vector3(0, 0, 1)
  const angleRad = normal.angleTo(up)
  const slope = THREE.MathUtils.radToDeg(angleRad)

  // Swap y and x in atan to get clockwise angle from y-axis
  const azimuthRad = Math.atan2(normal.x, normal.y)
  let azimuth = THREE.MathUtils.radToDeg(azimuthRad)
  if (azimuth < 0) {
    azimuth += 360
  }

  return [slope, azimuth]
}
