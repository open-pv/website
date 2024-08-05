import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
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
    <Box position="relative" width="100%" height="100%">
      {frontendState == "Results" && (
        <Button
          ref={btnRef}
          colorScheme="teal"
          onClick={onOpen}
          variant={"link"}
          position="absolute"
          top="10px"
          left="10px"
          zIndex={100}
        >
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
      <Stack spacing="24px">
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
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Stack>
    </Box>
  )
}

export default Overlay
