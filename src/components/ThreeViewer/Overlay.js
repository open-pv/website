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
  geoLocation,
  visiblePVSystems,
  setvisiblePVSystems,
  pvPoints,
  setPVPoints,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
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
            {t("button.options")}
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
          pvPoints={pvPoints}
          setPVPoints={setPVPoints}
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
              geoLocation,
            })
          }
        >
          {t("button.simulateBuilding")}
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
  const [sliderValue, setSliderValue] = React.useState(window.numSimulations)
  return (
    <Stack spacing="24px">
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size={"xs"}>
        <DrawerOverlay />
        <DrawerContent height={"100%"}>
          <DrawerCloseButton />
          <DrawerHeader>{t("button.options")}</DrawerHeader>

          <DrawerBody>
            <>
              <Text as="b">{t("sidebar.header")}</Text>
              <Text>{t("sidebar.mainText")}</Text>

              <Button variant={"link"}>Baum erstellen</Button>
              <HoverHelp
                label={
                  "Lege einen Baum an, um diesen in der nächsten Simulation zu berücksichtigen."
                }
              />

              <FormLabel>
                {t("button.showMap")}
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
                sliderValue={sliderValue}
                setSliderValue={(newValue) => {
                  setSliderValue(newValue)
                  window.numSimulations = newValue
                }}
              />
            </>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Stack>
  )
}

export default Overlay
