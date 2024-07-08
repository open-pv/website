import { useState } from "react"

import { Canvas } from "react-three-fiber"
import Overlay from "./Overlay"

export default function ThreeViewer({ showSimulatedBuilding }) {
  if (window.offsetPos == null) {
    window.offsetPos = [0, 0]
  }

  return (
    <div className="viewer-container" style={{ position: "relative" }}>
      <Canvas className="three-viewer" flat linear></Canvas>

      {!showSimulatedBuilding && <p>Show Map now</p>}
      {showSimulatedBuilding && <Overlay />}
    </div>
  )
}
