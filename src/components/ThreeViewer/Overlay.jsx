import { Button } from '@/components/ui/button'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { NumberInputField, NumberInputRoot } from '@/components/ui/number-input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Box, List, SimpleGrid, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPVSystem } from './Meshes/PVSystems'

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
  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState(window.numSimulations)
  const handleCreatePVButtonClick = () => {
    createPVSystem({
      setPVSystems,
      setSelectedPVSystem,
      pvPoints,
      setPVPoints,
      simulationMeshes,
    })
    setFrontendState('Results')
  }

  const OptionsDialog = () => {
    return (
      <DialogRoot>
        <DialogTrigger asChild>
          <Button>{t('button.options')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sidebar.header')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>{t('sidebar.mainText')}</p>
            <br />
            <SimpleGrid columns={2} gap='40px'>
              <p>{t('button.showMap')}</p>
              <Switch
                checked={showTerrain}
                onCheckedChange={() => setShowTerrain((prev) => !prev)}
              />
            </SimpleGrid>
            <br />
            <SimpleGrid columns={2} gap='40px'>
              <p>{t('sidebar.numberSimulations')}</p>
              <Slider
                min={1}
                max={200}
                value={sliderValue}
                onValueChange={(newValue) => {
                  setSliderValue(newValue.value)
                  window.numSimulations = newValue
                }}
                marks={[
                  { value: 1, label: '1' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 150, label: '150' },
                  { value: 200, label: '200' },
                ]}
              />
            </SimpleGrid>
          </DialogBody>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }

  const ControlHelperDialog = () => {
    const touchDeviceText = window.isTouchDevice ? 'touch.' : ''
    const { t } = useTranslation()
    return (
      <DialogRoot>
        <DialogTrigger asChild>
          <Button>{t('mapControlHelp.button')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`mapControlHelp.title`)}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <List.Root>
              <List.Item>
                {t(`mapControlHelp.${touchDeviceText}leftMouse`)}
              </List.Item>
              <List.Item>
                {t(`mapControlHelp.${touchDeviceText}rightMouse`)}
              </List.Item>
              <List.Item>
                {t(`mapControlHelp.${touchDeviceText}wheel`)}
              </List.Item>
              <List.Item>
                {t(`mapControlHelp.${touchDeviceText}doubleClick`)}
              </List.Item>
            </List.Root>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }

  const OverlayWrapper = ({ children }) => {
    return (
      <Box pointerEvents='none' zIndex={100}>
        <SimpleGrid
          margin='10px'
          minChildWidth='sm'
          gap='40px'
          pointerEvents='auto'
        >
          {children}
        </SimpleGrid>
      </Box>
    )
  }

  return (
    <OverlayWrapper>
      {selectedPVSystem.length > 0 && (
        <SelectionNotificationPV
          selectedPVSystem={selectedPVSystem}
          setSelectedPVSystem={setSelectedPVSystem}
          setPVSystems={setPVSystems}
        />
      )}
      <ControlHelperDialog />
      {frontendState == 'Results' && (
        <>
          <OptionsDialog />
          <Button
            onClick={() => {
              setFrontendState('DrawPV')
            }}
          >
            {t('button.drawPVSystem')}
          </Button>
        </>
      )}
      {frontendState == 'DrawPV' && (
        <>
          <Button onClick={() => setFrontendState('Results')}>
            {t('button.cancel')}
          </Button>
          {pvPoints.length > 0 && (
            <>
              <Button onClick={handleCreatePVButtonClick}>
                {t('button.createPVSystem')}
              </Button>
              <Button
                onClick={() => {
                  setPVPoints(pvPoints.slice(0, -1))
                }}
              >
                {t('button.deleteLastPoint')}
              </Button>
            </>
          )}
        </>
      )}
    </OverlayWrapper>
  )
}

const SelectionNotificationPV = ({
  selectedPVSystem,
  setSelectedPVSystem,
  setPVSystems,
}) => {
  const { t } = useTranslation()
  const SavingCalculationDialog = ({
    selectedPVSystem,
    setSelectedPVSystem,
  }) => {
    const { t } = useTranslation()
    const [annualConsumption, setAnnualConsumption] = useState('3000')
    const [storageCapacity, setStorageCapacity] = useState('0')
    const [electricityPrice, setElectricityPrice] = useState('30')
    const [selfConsumption, setSelfConsumption] = useState(0)
    const [annualSavings, setAnnualSavings] = useState(0)

    // Helper function to normalize input with different decimal separators
    const normalizeInput = (value) => {
      return value.replace(',', '.')
    }

    // Helper function to handle numeric input changes
    const handleNumericChange = (setter) => (e) => {
      const value = e.target.value
      if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
        setter(value)
      }
    }

    let pvProduction
    if (selectedPVSystem.length > 0) {
      pvProduction = Math.round(
        selectedPVSystem.reduce(
          (previous, current) => previous + current.annualYield,
          0,
        ),
      )
    }

    async function handleCalculateSaving() {
      async function calculateSaving({
        pvProduction,
        consumptionHousehold,
        storageCapacity,
        electricityPrice,
        setSelfConsumption,
        setAnnualSavings,
      }) {
        const response = await fetch(
          'https://www.openpv.de/data/savings_calculation/cons_prod.json',
        )
        const data = await response.json()

        const normalizedConsumption = data['Consumption']
        const normalizedProduction = data['Production']

        const result = {}
        let currentStorageLevel = 0
        for (const timestamp in normalizedConsumption) {
          const consumptionValue =
            (normalizedConsumption[timestamp] * consumptionHousehold) / 1000
          const productionValue =
            (normalizedProduction[timestamp] * pvProduction) / 1000

          let selfConsumption = 0
          let excessProduction = 0

          if (productionValue > consumptionValue) {
            selfConsumption = consumptionValue
            excessProduction = productionValue - consumptionValue

            // Charge the storage
            const availableStorageSpace = storageCapacity - currentStorageLevel
            const chargedAmount = Math.min(
              excessProduction,
              availableStorageSpace,
            )
            currentStorageLevel += chargedAmount
          } else {
            const productionDeficit = consumptionValue - productionValue

            // Use storage if available
            const usedFromStorage = Math.min(
              productionDeficit,
              currentStorageLevel,
            )
            currentStorageLevel -= usedFromStorage

            selfConsumption = productionValue + usedFromStorage
          }

          result[timestamp] = selfConsumption
        }

        let selfConsumedElectricity = Object.values(result).reduce(
          (acc, val) => acc + val,
          0,
        )

        setSelfConsumption(Math.round(selfConsumedElectricity))
        setAnnualSavings(
          Math.round((selfConsumedElectricity * electricityPrice) / 100),
        )
      }

      await calculateSaving({
        pvProduction: pvProduction,
        consumptionHousehold: parseFloat(normalizeInput(annualConsumption)),
        storageCapacity: parseFloat(normalizeInput(storageCapacity)),
        electricityPrice: parseFloat(normalizeInput(electricityPrice)),
        setSelfConsumption: setSelfConsumption,
        setAnnualSavings: setAnnualSavings,
      })
    }

    return (
      <DialogRoot size='lg'>
        <DialogTrigger asChild>
          <Button>{t('savingsCalculation.button')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('savingsCalculation.button')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>{t('savingsCalculation.disclaimer')}</p>
            <SimpleGrid columns={2} gap='10px'>
              <Text as='b' color={'black'}>
                {t('savingsCalculation.results.production')}
              </Text>

              <Text as='b' color={'black'}>
                {pvProduction} kWh
              </Text>
              <NumberInputRoot
                maxW='200px'
                value={annualConsumption}
                onValueChange={(e) => setAnnualConsumption(e.value)}
              >
                <NumberInputField />
              </NumberInputRoot>
            </SimpleGrid>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogActionTrigger>
            <Button>Save</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }
  return (
    <DialogRoot open={true} placement='bottom' size='xs'>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('savingsCalculation.notificationLabel')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <SimpleGrid gap='5px'>
            <SavingCalculationDialog
              selectedPVSystem={selectedPVSystem}
              setSelectedPVSystem={setSelectedPVSystem}
            />
            <Button
              colorScheme='teal'
              onClick={() => {
                setPVSystems([])
                setSelectedPVSystem([])
              }}
            >
              {t('delete')}
            </Button>
            <Button onClick={() => setSelectedPVSystem([])}>Cancel</Button>
          </SimpleGrid>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}

export default Overlay
