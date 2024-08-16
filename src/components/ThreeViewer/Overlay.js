import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Stack,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { simulationForNewBuilding } from "../../simulation/main"
import HoverHelp from "../Template/HoverHelp"
import SliderWithLabel from "../Template/SliderWithLabel"

import React from "react"
import ButtonWithHoverHelp from "../Template/ButtonWithHoverHelp"
import OverlayDrawPV from "./OverlayDrawPV"

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
    <OverlayWrapper>
      {frontendState == "Results" && (
        <>
          <Button
            ref={btnRef}
            colorScheme="teal"
            onClick={onOpen}
            variant={"link"}
            zIndex={100}
          >
            Optionen
          </Button>
          <ButtonWithHoverHelp
            buttonLabel={"PV Anlage einzeichnen"}
            onClick={() => {
              setFrontendState("DrawPV")
              onClose()
            }}
            hoverText={
              "PV-Anlage in der Karte einzeichnen und Jahresbetrag berechnen."
            }
          />
        </>
      )}
      {frontendState == "DrawPV" && (
        <OverlayDrawPV
          setvisiblePVSystems={setvisiblePVSystems}
          visiblePVSystems={visiblePVSystems}
        />
      )}
      {selectedMesh.length > 0 && (
        <Button
          colorScheme="teal"
          variant={"link"}
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
      <CustomDrawer
        isOpen={isOpen}
        onClose={onClose}
        showTerrain={showTerrain}
        setShowTerrain={setShowTerrain}
      />
    </OverlayWrapper>
  )
}

const OverlayWrapper = ({ children }) => {
  return (
    <>
      <Box
        display="flex"
        flexDirection="column" // First direction Column and second Box flexDirection
        // row pushes buttons to the upper left corner
        justifyContent="space-between"
        pointerEvents="none"
        zIndex={100}
        minWidth={0}
        minHeight={0}
        overflow="hidden"
        sx={{
          "> *": {
            pointerEvents: "auto",
          },
        }}
      >
        <Box
          display="flex"
          flexDirection="row"
          gap="20px"
          padding="10px"
          width="fit-content"
          maxWidth="100%"
          flexWrap="wrap"
          minWidth={0}
          minHeight={0}
          overflow="hidden"
        >
          {children}
        </Box>
      </Box>
    </>
  )
}

const CustomDrawer = ({ isOpen, onClose, showTerrain, setShowTerrain }) => {
  const { t } = useTranslation()
  return (
    <Stack spacing="24px">
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size={"xs"}>
        <DrawerOverlay />
        <DrawerContent height={"100%"}>
          <DrawerCloseButton />
          <DrawerHeader>Optionen</DrawerHeader>

          <DrawerBody>
            <>
              <Text as="b">{t("sidebar.header")}</Text>
              <Text>{t("sidebar.mainText")}</Text>

              <Button variant={"link"} _hover={{ color: "blue.500" }}>
                Baum erstellen
              </Button>
              <HoverHelp
                label={
                  "Lege einen Baum an, um diesen in der nächsten Simulation zu berücksichtigen."
                }
              />

              <FormLabel>
                Karte anzeigen
                <Switch
                  isChecked={showTerrain}
                  onChange={() => setShowTerrain((prev) => !prev)}
                  colorScheme="teal"
                  margin={"5px"}
                />
              </FormLabel>

              <SliderWithLabel
                sliderProps={{ min: 1, max: 200 }}
                label={"Anzahl Simulationen"}
                hoverHelpLabel={"Hi"}
              />
            </>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Stack>
  )
}

export default Overlay
