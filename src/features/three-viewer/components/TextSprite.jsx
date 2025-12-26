import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const TextSprite = ({ text, position }) => {
  const spriteRef = useRef()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const canvasRatio = 7
    canvas.width = 128 * canvasRatio
    canvas.height = 128

    context.font = '55px Arial'
    context.fillStyle = 'rgba(0, 0, 0, 0.3)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    const lines = text.split('\n')
    context.font = '55px Arial'
    context.fillStyle = 'white'
    lines.forEach((line, index) => {
      context.fillText(line, 10, 60 + index * 60)
    })

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
    })

    spriteRef.current.material = spriteMaterial
    spriteRef.current.position.copy(position)
    spriteRef.current.scale.set(canvasRatio, 1, 1)
    spriteRef.current.renderOrder = 999
  }, [text, position])

  return <sprite ref={spriteRef} />
}

export default TextSprite
