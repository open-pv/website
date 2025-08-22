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
  const getIntersects = () => {
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

  const handleDoubleClick = (event) => {
    event.preventDefault()

    const intersects = getIntersects()

    if (intersects.length === 0) {
      console.log('No children in the intersected mesh.')
      return
    }

    const intersectedMesh = ignoreSprites(intersects).object

    if (!intersectedMesh) return
    if (!intersectedMesh.geometry.name) {
      console.log(
        "There is a mesh, but it has no name so I don't know what to do.",
      )
      return
    }
    console.log(intersectedMesh)
    if (
      intersectedMesh.geometry.name.includes('surrounding') ||
      intersectedMesh.geometry.name.includes('background')
    ) {
      sceneContext.setSelectedMesh([intersectedMesh])
    }
    if (intersectedMesh.geometry.name.includes('pvSystem')) {
      sceneContext.setSelectedPVSystem([intersectedMesh.geometry])
    }
  }

  const handleMouseMove = (event) => {
    event.preventDefault()
    const intersects = getIntersects()
    const intersectedFace = ignoreSprites(intersects).face
    const slope = calculateSlopeFromNormal(intersectedFace.normal)
    sceneContext.setSlope(Math.round(slope))
  }

  useEffect(() => {
    const canvas = gl.domElement

    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick)
      canvas.addEventListener('mousemove', handleMouseMove)
    }
  }, [camera, scene])

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return (
    <MapControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      target={sceneContext.simulationMeshes[0].middle}
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

const calculateSlopeFromNormal = (normal) => {
  const up = new THREE.Vector3(0, 0, 1)
  const angleRad = normal.angleTo(up)
  return THREE.MathUtils.radToDeg(angleRad)
}
