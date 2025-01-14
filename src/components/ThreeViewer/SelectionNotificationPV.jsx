import {
  Alert,
  AlertDescription,
  Box,
  Button,
  CloseButton,
  useDisclosure,
  Wrap,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SavingCalculation from '../PVSimulation/SavingsCalculation'

const SelectionNotificationPV = ({
  selectedPVSystem,
  setSelectedPVSystem,
  setPVSystems,
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { t } = useTranslation()

  useEffect(() => {
    if (selectedPVSystem.length > 0) {
      onOpen()
    }
  }, [selectedPVSystem])

  const handleCloseAlert = () => {
    onClose()
    setSelectedPVSystem([])
  }

  if (!isOpen) return null

  return (
    <Box
      position='fixed'
      bottom={4}
      left='50%'
      transform='translateX(-50%)'
      width='300px'
      zIndex={9999}
    >
      <Alert alignItems='start' boxShadow='md' rounded='md' colorScheme='gray'>
        <Box width='100%'>
          <AlertDescription display='block' mb={2}>
            {t('savingsCalculation.notificationLabel')}
          </AlertDescription>
          <Wrap spacing={2} justify='start'>
            <SavingCalculation
              selectedPVSystem={selectedPVSystem}
              setSelectedPVSystem={setSelectedPVSystem}
              onCloseAlert={onClose}
            />
            <Button
              colorScheme='teal'
              onClick={() => {
                setPVSystems([])
                setSelectedPVSystem([])
                onClose()
              }}
            >
              {t('delete')}
            </Button>
          </Wrap>
        </Box>
        <CloseButton
          position='absolute'
          right={1}
          top={1}
          onClick={handleCloseAlert}
        />
      </Alert>
    </Box>
  )
}

export default SelectionNotificationPV
