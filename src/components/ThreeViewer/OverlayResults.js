import React from "react"
export default function OverlayResults({
  setFrontendState,
  showTerrain,
  setShowTerrain,
  selectedMesh,
}) {
  return (
    <div className="overlay">
      <div className="overlay-buttons">
        <button onClick={() => setFrontendState("DrawPV")}>
          PV Anlage einzeichnen
        </button>
        <button onClick={() => setShowTerrain(!showTerrain)}>
          Karte ein-/ausblenden
        </button>
        {selectedMesh && (
          <button className="button-high-prio">Gebäude simulieren</button>
        )}
      </div>
    </div>
  )
}
