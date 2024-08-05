import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { simulationForNewBuilding } from "../../simulation/main"

import React from "react"
import OverlayDrawPV from "./OverlayDrawPV"
import OverlayResults from "./OverlayResults"

function Overlay({
  frontendState,
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
  visiblePVSystems,
  setvisiblePVSystems,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  return (
    <div className="overlay">
      <div className="overlay-buttons">
        {frontendState == "Results" && (
          <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
            Optionen
          </Button>
        )}
        {frontendState == "DrawPV" && (
          <OverlayDrawPV
            setvisiblePVSystems={setvisiblePVSystems}
            visiblePVSystems={visiblePVSystems}
          />
        )}
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
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          finalFocusRef={btnRef}
          size={"xs"}
        >
          <DrawerOverlay />
          <DrawerContent height={"100%"}>
            <DrawerCloseButton />
            <DrawerHeader>Optionen</DrawerHeader>

            <DrawerBody>
              {frontendState == "Results" && (
                <OverlayResults
                  setFrontendState={setFrontendState}
                  showTerrain={showTerrain}
                  setShowTerrain={setShowTerrain}
                  onCloseDrawer={onClose}
                />
              )}

              <p>Weitere Optionen</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

export default Overlay
