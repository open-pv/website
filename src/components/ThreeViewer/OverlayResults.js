import React from "react"
import Footer from "./Footer"
export default function OverlayResults({
  setFrontendState,
  showTerrain,
  setShowTerrain,
}) {
  return (
    <div className="overlay">
      <div className="overlay-buttons">
        <button onClick={() => setFrontendState("DrawPV")}>
          PV Anlage einzeichnen
        </button>
        <button>Parameter ändern</button>
        <button onClick={() => setShowTerrain(!showTerrain)}>
          Karte ein-/ausblenden
        </button>
      </div>

      <Footer />
    </div>
  )
}
