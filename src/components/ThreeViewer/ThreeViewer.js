import { useState } from "react"

import { MapControls } from "@react-three/drei"

import Overlay from "./Overlay"
import Scene from "./Scene"

export default function ThreeViewer() {
  const [IsDrawPV, setIsDrawPV] = useState(false)
  window.setIsDrawPV = setIsDrawPV
  return (
    <div className="viewer-container" style={{ position: "relative" }}></div>
  )
}
