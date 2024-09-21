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
import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { simulationForNewBuilding } from "../../simulation/main"
import SavingCalculation from "../PVSimulation/SavingsCalculation"
import ButtonWithHoverHelp from "../Template/ButtonWithHoverHelp"
import SliderWithLabel from "../Template/SliderWithLabel"
import { createPVSystem } from "./Meshes/PVSystems"
import SelectionNotificationPV from "./SelectionNotificationPV"

function Overlay({
  frontendState,
  setFrontendState,
  showTerrain,
  setShowTerrain,
  selectedMesh,
  setSelectedMesh,
  selectedPVSystem,
  setSelectedPVSystem,
  geometries,
  geoLocation,
  pvSystems,
  setPVSystems,
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
  const handleCreatePVButtonClick = () => {
    createPVSystem({
      setPVSystems,
      pvPoints,
      setPVPoints,
      simulationMeshes,
    })
    setFrontendState("Results")
  }

  const handleAbortButtonClick = () => {
    setFrontendState("Results")
  }

  return (
    <>
      <OverlayWrapper>
        <SelectionNotificationPV
          selectedPVSystem={selectedPVSystem}
          setSelectedPVSystem={setSelectedPVSystem}
          setPVSystems={setPVSystems}
        />
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
          </>
        )}

        <Button
          onClick={onOpenModalControls}
          colorScheme="teal"
          variant={"link"}
        >
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
      <HighPrioWrapper>
        {frontendState == "Results" && (
          <ButtonWithHoverHelp
            buttonLabel={t("button.drawPVSystem")}
            onClick={() => {
              setFrontendState("DrawPV")
              onCloseDrawer()
            }}
            className={pvSystems.length == 0 ? "button-high-prio" : ""}
            hoverText={t("button.drawPVSystemHover")}
          />
        )}

        {selectedMesh.length > 0 && (
          <Button
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
        {frontendState == "DrawPV" && (
          <>
            {pvPoints.length > 0 && (
              <>
                <Button
                  className="button-high-prio"
                  onClick={handleCreatePVButtonClick}
                >
                  {t("button.createPVSystem")}
                </Button>
                <Button
                  onClick={() => {
                    setPVPoints(pvPoints.slice(0, -1))
                  }}
                >
                  {t("button.deleteLastPoint")}
                </Button>
              </>
            )}
            <Button onClick={handleAbortButtonClick}>
              {t("button.cancel")}
            </Button>
          </>
        )}
      </HighPrioWrapper>
    </>
  )
}

const OverlayWrapper = ({ children }) => {
  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
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
          flexDirection="column"
          alignItems="flex-start" // Add this line
          gap="20px"
          padding="10px"
          height="fit-content"
          maxHeight="100%"
          flexWrap="nowrap"
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

const HighPrioWrapper = ({ children }) => {
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
          marginLeft="auto" // Add this line
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
                label={t("sidebar.numberSimulations")}
                hoverHelpLabel={t("sidebar.numberSimulationsHover")}
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
  const touchDeviceText = window.isTouchDevice ? "touch." : ""
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
