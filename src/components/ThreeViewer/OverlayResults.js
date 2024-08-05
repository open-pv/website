import { Button, Checkbox } from "@chakra-ui/react"
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
        <Button onClick={() => setFrontendState("DrawPV")}>
          PV Anlage einzeichnen
        </Button>
        <Checkbox
          checked={showTerrain} // This binds the checkbox's checked state to the showTerrain state
          onChange={() => setShowTerrain((prev) => !prev)} // Toggles the showTerrain state
        >
          {showTerrain ? "Karte ausblenden" : "Karte einblenden"}
        </Checkbox>
        {selectedMesh.length > 0 && (
          <Button
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
          </Button>
        )}
      </div>
    </div>
  )
}
