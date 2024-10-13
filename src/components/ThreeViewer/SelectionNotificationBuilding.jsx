import {
  Alert,
  Box,
  Button,
  CloseButton,
  useDisclosure,
  Wrap,
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { simulationForNewBuilding } from "../../simulation/main"

const SelectionNotificationBuilding = ({
  selectedMesh,
  setSelectedMesh,
  simulationMeshes,
  setSimulationMeshes,
  geometries,
  geoLocation,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (selectedMesh.length > 0) {
      onOpen()
    }
  }, [selectedMesh])

  const handleCloseAlert = () => {
    onClose()
    setSelectedMesh([])
  }

  if (!isOpen) return null

  const handleResimulationClick = async () => {
    setIsLoading(true)
    try {
      await simulationForNewBuilding({
        selectedMesh,
        setSelectedMesh,
        simulationMeshes,
        setSimulationMeshes,
        geometries,
        geoLocation,
      })
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Box
      position="fixed"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      width="300px"
      zIndex={9999}
    >
      <Alert alignItems="start" boxShadow="md" rounded="md" colorScheme="gray">
        <Box width="100%">
          <Wrap spacing={2} justify="start">
            <Button
              isLoading={isLoading}
              colorScheme="teal"
              onClick={handleResimulationClick}
            >
              {t("button.simulateBuilding")}
            </Button>
          </Wrap>
        </Box>
        <CloseButton
          position="absolute"
          right={1}
          top={1}
          onClick={handleCloseAlert}
        />
      </Alert>
    </Box>
  )
}

export default SelectionNotificationBuilding
