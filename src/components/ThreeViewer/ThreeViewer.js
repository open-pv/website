import { useState } from "react"
import { Canvas } from "react-three-fiber"
import { setLocation } from "../../simulation/location"

export default function ThreeViewer() {
  const [loading, setLoading] = useState(false)
  if (window.offsetPos == null) {
    window.offsetPos = [0, 0]
  }

  const resimulate = () => {
    setLoading(!loading)
    window.setShowViridisLegend(false)
    window.setShowThreeViewer(true)
    setLocation("", false, window.mapLocation)
    window.numRadiusSimulationChanged = false
    window.numSimulationsChanged = false
    window.mapLocationChanged = false
    setShowErrorMessage(false)
    setShowTooManyUniformsError(false)
  }

  return (
    <div className="viewer-container" style={{ position: "relative" }}>
      <Canvas className="three-viewer" flat linear></Canvas>
      <canvas id="canvas" width={0} height={0}></canvas>
      {window.showViridisLegend && (
        <div
          style={{ position: "absolute", left: 0, bottom: 0, margin: "10px" }}
        >
          <p style={{ fontSize: "8px" }}>
            <a href="https://geodaten.bayern.de/opengeodata/">Gebäudedaten</a>{" "}
            der
            <a href="https://www.ldbv.bayern.de/vermessung/bvv.html">
              {" "}
              Bayerischen Vermessungsverwaltung{" "}
            </a>{" "}
            |
            <a href="https://creativecommons.org/licenses/by/4.0/deed.de">
              CC BY 4.0
            </a>
          </p>
          <p>
            <b>Leertaste</b>: Eckpunkt <b>P</b>: Polygon erstellen <b>R</b>:
            Alles zurücksetzen
          </p>
        </div>
      )}
    </div>
  )
}
