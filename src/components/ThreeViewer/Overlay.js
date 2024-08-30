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
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Switch,
  Text,
  UnorderedList,
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
  geoLocation,
  visiblePVSystems,
  setvisiblePVSystems,
  pvPoints,
  setPVPoints,
  simulationMeshes,
  setSimulationMeshes,
}) {
  const {
    isOpen: isOpenDrawer,
    onOpen: onOpenDrawer,
    onClose: onCloseDrawer,
  } = useDisclosure()
  const {
    isOpen: isOpenModalControls,
    onOpen: onOpenModalControls,
    onClose: onCloseModalControls,
  } = useDisclosure()
  const { t } = useTranslation()
  const btnRef = React.useRef()

  return (
    <OverlayWrapper>
      {frontendState == "Results" && (
        <>
          <Button
            ref={btnRef}
            colorScheme="teal"
            onClick={onOpenDrawer}
            variant={"link"}
            zIndex={100}
          >
            {t("button.options")}
          </Button>
          <ButtonWithHoverHelp
            buttonLabel={"PV Anlage einzeichnen"}
            onClick={() => {
              setFrontendState("DrawPV")
              onCloseDrawer()
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
          setFrontendState={setFrontendState}
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
              simulationMeshes,
              setSimulationMeshes,
              geometries,
              geoLocation,
            })
          }
        >
          {t("button.simulateBuilding")}
        </Button>
      )}
      <Button onClick={onOpenModalControls} colorScheme="teal" variant={"link"}>
        {t("mapControlHelp.button")}
      </Button>
      <ModalControls
        isOpen={isOpenModalControls}
        onClose={onCloseModalControls}
      />
      <CustomDrawer
        isOpen={isOpenDrawer}
        onClose={onCloseDrawer}
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

const ModalControls = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const touchDeviceText = window.isTouch ? "touch." : ""
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t(`mapControlHelp.title`)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <UnorderedList>
            <ListItem>
              {t(`mapControlHelp.${touchDeviceText}leftMouse`)}
            </ListItem>
            <ListItem>
              {t(`mapControlHelp.${touchDeviceText}rightMouse`)}
            </ListItem>
            <ListItem>{t(`mapControlHelp.${touchDeviceText}wheel`)}</ListItem>
            <ListItem>
              {t(`mapControlHelp.${touchDeviceText}doubleClick`)}
            </ListItem>
          </UnorderedList>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
