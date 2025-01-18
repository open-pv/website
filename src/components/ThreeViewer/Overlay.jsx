import { Button } from '@/components/ui/button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { NumberInputField, NumberInputRoot } from '@/components/ui/number-input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Box,
  Collapsible,
  Grid,
  List,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { simulationForNewBuilding } from '../../simulation/main'
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
  const [open, setOpen] = useState(false)
  const OptionsDialog = () => {
    return (
      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
        <DialogTrigger asChild>
          <Button variant='subtle'>{t('button.options')}</Button>
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
                  window.numSimulations = newValue.value[0]
                  console.log(newValue.value[0])
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
          <Button variant='subtle'>{t('mapControlHelp.button')}</Button>
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
      <>
        <Box display='flex' pointerEvents='none' zIndex={100} overflow='hidden'>
          <Box
            display='flex'
            flexDirection='column'
            gap='10px'
            padding='10px'
            height='fit-content'
            overflow='hidden'
            pointerEvents='auto'
            sx={{
              button: {
                minWidth: '100px', // Set the desired width
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </>
    )
  }

  return (
    <OverlayWrapper>
      {selectedMesh.length > 0 && (
        <SelectionNotificationBuilding
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
          simulationMeshes={simulationMeshes}
          setSimulationMeshes={setSimulationMeshes}
          geometries={geometries}
          geoLocation={geoLocation}
        />
      )}
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
            variant='subtle'
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
          <Button variant='subtle' onClick={() => setFrontendState('Results')}>
            {t('button.cancel')}
          </Button>
          {pvPoints.length > 0 && (
            <>
              <Button variant='subtle' onClick={handleCreatePVButtonClick}>
                {t('button.createPVSystem')}
              </Button>
              <Button
                variant='subtle'
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
  const SavingCalculationDialog = ({ selectedPVSystem }) => {
    const { t } = useTranslation()
    const [annualConsumption, setAnnualConsumption] = useState('3000')
    const [storageCapacity, setStorageCapacity] = useState('0')
    const [electricityPrice, setElectricityPrice] = useState('30')
    const [selfConsumption, setSelfConsumption] = useState(0)
    const [annualSavings, setAnnualSavings] = useState(0)
    const [showResults, setShowResults] = useState(false)

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
        consumptionHousehold: annualConsumption,
        storageCapacity: storageCapacity,
        electricityPrice: electricityPrice,
        setSelfConsumption: setSelfConsumption,
        setAnnualSavings: setAnnualSavings,
      })
    }

    return (
      <DialogRoot size='lg'>
        <DialogTrigger asChild>
          <Button variant='subtle'>{t('savingsCalculation.button')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('savingsCalculation.button')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>{t('savingsCalculation.disclaimer')}</p>
            <br />
            <SimpleGrid
              columns={1}
              columnGap='2'
              rowGap='4'
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Field
                label={t('savingsCalculation.consumptionTitle')}
                helperText={t('savingsCalculation.consumptionHelperInfo')}
              >
                <NumberInputRoot
                  value={annualConsumption}
                  onValueChange={(e) => setAnnualConsumption(e.value)}
                >
                  <NumberInputField />
                </NumberInputRoot>
              </Field>

              <Field label={t('savingsCalculation.storageTitle')}>
                <NumberInputRoot
                  maxW='200px'
                  value={storageCapacity}
                  onValueChange={(e) => setStorageCapacity(e.value)}
                >
                  <NumberInputField />
                </NumberInputRoot>
              </Field>
              <Field label={t('savingsCalculation.electricityPriceTitle')}>
                <NumberInputRoot
                  maxW='200px'
                  value={electricityPrice}
                  onValueChange={(e) => setElectricityPrice(e.value)}
                >
                  <NumberInputField />
                </NumberInputRoot>
              </Field>
            </SimpleGrid>
            <Collapsible.Root open={showResults}>
              <Collapsible.Content>
                <Box
                  p='40px'
                  color='white'
                  mt='4'
                  bg='teal'
                  rounded='md'
                  shadow='md'
                >
                  <Text>{t('savingsCalculation.disclaimer')}</Text>
                  <br />
                  <List.Root>
                    <List.Item>
                      {t('savingsCalculation.results.production')}
                      <Text as='b' color={'white'}>
                        {pvProduction} kWh
                      </Text>
                    </List.Item>
                    <List.Item>
                      {t('savingsCalculation.results.consumption')}
                      <Text as='b' color={'white'}>
                        {selfConsumption} kWh
                      </Text>
                    </List.Item>
                    <List.Item>
                      {t('savingsCalculation.results.savings')}
                      <Text as='b' color={'white'}>
                        {annualSavings}€
                      </Text>
                    </List.Item>
                  </List.Root>
                </Box>
              </Collapsible.Content>
            </Collapsible.Root>
          </DialogBody>
          <DialogFooter>
            <Button
              variant='subtle'
              mr={3}
              onClick={() => {
                handleCalculateSaving()
                setShowResults(true)
              }}
            >
              {t('savingsCalculation.calculate')}
            </Button>
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
            <SavingCalculationDialog selectedPVSystem={selectedPVSystem} />
            <Button
              variant='subtle'
              onClick={() => {
                setPVSystems([])
                setSelectedPVSystem([])
              }}
            >
              {t('delete')}
            </Button>
            <Button variant='subtle' onClick={() => setSelectedPVSystem([])}>
              {t('button.cancel')}
            </Button>
          </SimpleGrid>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
const SelectionNotificationBuilding = ({
  selectedMesh,
  setSelectedMesh,
  simulationMeshes,
  setSimulationMeshes,
  geometries,
  geoLocation,
}) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const handleResimulationClick = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <DialogRoot open={true} placement='bottom' size='xs'>
      <DialogContent>
        <DialogHeader></DialogHeader>
        <DialogBody>
          <SimpleGrid gap='5px'>
            <Button
              variant='subtle'
              loading={loading}
              onClick={handleResimulationClick}
            >
              {t('button.simulateBuilding')}
            </Button>
            <Button variant='subtle' onClick={() => setSelectedMesh([])}>
              {t('button.cancel')}
            </Button>
          </SimpleGrid>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}

export default Overlay
