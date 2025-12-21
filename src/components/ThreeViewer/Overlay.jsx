import { Button } from '@/components/ui/button'
import { DataListItem, DataListRoot } from '@/components/ui/data-list'
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
import { colormaps } from '@openpv/simshady'

import { NumberInputField, NumberInputRoot } from '@/components/ui/number-input'
import { Switch } from '@/components/ui/switch'
import {
  Box,
  Collapsible,
  List,
  Menu,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { c0, c1, c2 } from '../../data/constants'
import { SceneContext } from '../context'
import { createPVSystem } from './Meshes/PVSystems'

function Overlay({ frontendState, setFrontendState }) {
  const sceneContext = useContext(SceneContext)
  const { t } = useTranslation()
  const handleCreatePVButtonClick = () => {
    createPVSystem({
      setPVSystems: sceneContext.setPVSystems,
      setSelectedPVSystem: sceneContext.setSelectedPVSystem,
      pvPoints: sceneContext.pvPoints,
      setPVPoints: sceneContext.setPVPoints,
      simulatedBuildings: sceneContext.buildings.filter(
        (b) => b.type === 'simulation',
      ),
    })
    setFrontendState('Results')
  }
  const [isOpenOptionsDialog, setIsOpenOptionsDialog] = useState(false)
  const OptionsDialog = () => {
    return (
      <DialogRoot
        open={isOpenOptionsDialog}
        onOpenChange={(e) => setIsOpenOptionsDialog(e.open)}
      >
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
                checked={sceneContext.showTerrain}
                onCheckedChange={() =>
                  sceneContext.setShowTerrain((prev) => !prev)
                }
              />
            </SimpleGrid>
          </DialogBody>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }

  const [isOpenColorLegend, setIsOpenColorLegend] = useState(false)
  const ColorLegend = () => {
    const rgbToCss = ([r, g, b]) => {
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
    }
    const colorMap = colormaps.interpolateThreeColors({
      c0,
      c1,
      c2,
    })
    const steps = 50
    const gradient = Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1)
      return rgbToCss(colorMap(t))
    }).join(',')

    return (
      <DialogRoot
        open={isOpenColorLegend}
        onOpenChange={(e) => setIsOpenColorLegend(e.open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`colorLegend.button`)}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4}>
              <Box>
                <Box display='flex' justifyContent='space-between' px={1}>
                  <Text fontSize='sm'>{t(`colorLegend.description`)}</Text>
                </Box>
                <Box display='flex' justifyContent='space-between' px={1}>
                  <Text fontSize='sm'>0</Text>
                  <Text fontSize='sm'>500</Text>
                  <Text fontSize='sm'>1150</Text>
                </Box>
                <Box
                  id='colorLegend'
                  h='20px'
                  w='300px'
                  borderRadius='md'
                  style={{
                    background: `linear-gradient(to right, ${gradient})`,
                  }}
                />
              </Box>
            </VStack>
          </DialogBody>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }

  const [isOpenControlHelp, setIsOpenControlHelp] = useState(false)
  /**
   * The component for the "How do I control this app" button as well as the dialog.
   */
  const ControlHelperDialog = () => {
    const touchDeviceText = window.isTouchDevice ? 'touch.' : ''
    const { t } = useTranslation()
    return (
      <DialogRoot
        open={isOpenControlHelp}
        onOpenChange={(e) => setIsOpenControlHelp(e.open)}
      >
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
            </List.Root>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }
  /**
   * The component for the "How do I control this app" button as well as the dialog.
   */
  const [isOpenAdvertisment, setIsOpenAdvertisment] = useState(false)
  const AdvertismentDialog = () => {
    const data = [
      {
        label: t('adbox.balkonsolar'),
        value: 'https://balkon.solar',
        href: 'https://balkon.solar',
      },
      {
        label: t('adbox.companies'),
        value: 'https://www.sfv.de',
        href: 'https://www.sfv.de/solaranlagenberatung/sachverstaendige-1',
      },
      {
        label: t('adbox.bbe'),
        value: 'https://www.buendnis-buergerenergie.de/',
        href: 'https://www.buendnis-buergerenergie.de/karte',
      },
    ]

    return (
      <DialogRoot
        open={isOpenAdvertisment}
        onOpenChange={(e) => setIsOpenAdvertisment(e.open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('adbox.title')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>{t('adbox.introduction')}</p>
            <br />
            <DataListRoot>
              {data.map((item) => (
                <DataListItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  href={item.href}
                />
              ))}
            </DataListRoot>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }
  /**
   * Wrapper for the buttons that are shown on top of the Scene. The wrapper controls the size, order,
   * alignment of these buttons.
   */
  const OverlayWrapper = ({ children }) => {
    return (
      <>
        <Box display='flex' pointerEvents='none' zIndex={100} overflow='hidden'>
          <Box
            display='flex'
            flexDirection='row'
            flexWrap='wrap'
            gap='10px'
            padding='10px'
            height='fit-content'
            overflow='hidden'
            pointerEvents='auto'
            sx={{
              button: {
                minWidth: '100px',
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </>
    )
  }

  const MouseHoverInfo = () => {
    return (
      <div className='attribution' id='footer-on-hover'>
        {t('slope')}: {sceneContext.slope}°
        <br />
        {t('azimuth')}: {sceneContext.azimuth}°
        {sceneContext.yieldPerKWP ? (
          <p>
            {t('yieldPerKWP')}:{' '}
            {Math.round(sceneContext.yieldPerKWP / 100) * 100} kWh/kWp/a
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <>
      {!window.isTouchDevice && <MouseHoverInfo />}
      <OverlayWrapper>
        {sceneContext.selectedPVSystem.length > 0 && (
          <NotificationForSelectedPV />
        )}

        {frontendState == 'Results' && (
          <>
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
            <Button
              variant='subtle'
              onClick={() => setFrontendState('Results')}
            >
              {t('button.cancel')}
            </Button>
            {sceneContext.pvPoints.length > 2 && (
              <Button variant='solid' onClick={handleCreatePVButtonClick}>
                {t('button.createPVSystem')}
              </Button>
            )}
            {sceneContext.pvPoints.length > 0 && (
              <>
                <Button
                  variant='subtle'
                  onClick={() => {
                    sceneContext.setPVPoints(sceneContext.pvPoints.slice(0, -1))
                  }}
                >
                  {t('button.deleteLastPoint')}
                </Button>
              </>
            )}
          </>
        )}

        <Menu.Root>
          <Menu.Trigger>
            <Button variant='subtle' size='sm'>
              {t('button.more')}
            </Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item
              value='advertisment'
              onClick={() => setIsOpenAdvertisment(true)}
            >
              {t('adbox.button')}
            </Menu.Item>
            <Menu.Item
              value='options'
              onClick={() => setIsOpenOptionsDialog(true)}
            >
              {t('button.options')}
            </Menu.Item>
            <Menu.Item value='help' onClick={() => setIsOpenControlHelp(true)}>
              {t('mapControlHelp.button')}
            </Menu.Item>
            <Menu.Item
              value='legend'
              onClick={() => setIsOpenColorLegend(true)}
            >
              {t(`colorLegend.button`)}
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
        <AdvertismentDialog />
        <OptionsDialog />
        <ControlHelperDialog />
        <ColorLegend />
      </OverlayWrapper>
    </>
  )
}

/**
 * Controls the dialog component that appears when a PV system is selected. This includes the
 * dialog component of the economic savings calculation.
 */
const NotificationForSelectedPV = () => {
  const { t } = useTranslation()
  const sceneContext = useContext(SceneContext)
  /**
   * Controls the PV savings calculation dialog component together with the button to start this component.
   */
  const SavingCalculationDialog = () => {
    const sceneContext = useContext(SceneContext)
    const { t } = useTranslation()
    const [annualConsumption, setAnnualConsumption] = useState('3000')
    const [storageCapacity, setStorageCapacity] = useState('0')
    const [electricityPrice, setElectricityPrice] = useState('30')
    const [selfConsumption, setSelfConsumption] = useState(0)
    const [annualSavings, setAnnualSavings] = useState(0)
    const [showResults, setShowResults] = useState(false)

    let pvProduction
    if (sceneContext.selectedPVSystem.length > 0) {
      pvProduction = Math.round(
        sceneContext.selectedPVSystem.reduce(
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
    <DialogRoot
      open={true}
      placement='bottom'
      size='xs'
      onInteractOutside={() => sceneContext.setSelectedPVSystem([])}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('savingsCalculation.notificationLabel')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <SimpleGrid gap='5px'>
            <SavingCalculationDialog />
            <Button
              variant='subtle'
              onClick={() => {
                sceneContext.setPVSystems([])
                sceneContext.setSelectedPVSystem([])
              }}
            >
              {t('delete')}
            </Button>
          </SimpleGrid>
        </DialogBody>
        <DialogCloseTrigger
          onClick={() => sceneContext.setSelectedPVSystem([])}
        />
      </DialogContent>
    </DialogRoot>
  )
}

export default Overlay
