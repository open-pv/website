import React from "react"
import { simulationForNewBuilding } from "../../simulation/main"
export default function OverlayResults({
  setFrontendState,
  showTerrain,
  setShowTerrain,
  selectedMesh,
  setSelectedMesh,
  geometries,
  setDisplayedSimulationMesh,
  displayedSimulationMesh,
  deletedSurroundingMeshes,
  deletedBackgroundMeshes,
  geoLocation,
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
        {selectedMesh.length > 0 && (
          <button
            className="button-high-prio"
            onClick={async () =>
              await simulationForNewBuilding({
                selectedMesh,
                setSelectedMesh,
                geometries,
                displayedSimulationMesh,
                setDisplayedSimulationMesh,
                deletedSurroundingMeshes,
                deletedBackgroundMeshes,
                geoLocation,
              })
            }
          >
            Gebäude simulieren
          </button>
        )}
      </div>
    </div>
  )
}
