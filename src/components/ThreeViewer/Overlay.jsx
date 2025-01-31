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
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu'
import { NumberInputField, NumberInputRoot } from '@/components/ui/number-input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Box, Collapsible, List, SimpleGrid, Text } from '@chakra-ui/react'
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
    const [sliderValue, setSliderValue] = useState([100])
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
        <DialogTrigger asChild>
          <Button variant='subtle'>{t('adbox.button')}</Button>
        </DialogTrigger>
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

  return (
    <OverlayWrapper>
      {selectedMesh.length > 0 && (
        <NotificationForSelectedBuilding
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
          simulationMeshes={simulationMeshes}
          setSimulationMeshes={setSimulationMeshes}
          geometries={geometries}
          geoLocation={geoLocation}
        />
      )}
      {selectedPVSystem.length > 0 && (
        <NotificationForSelectedPV
          selectedPVSystem={selectedPVSystem}
          setSelectedPVSystem={setSelectedPVSystem}
          setPVSystems={setPVSystems}
        />
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
          <Button variant='subtle' onClick={() => setFrontendState('Results')}>
            {t('button.cancel')}
          </Button>
          {pvPoints.length > 2 && (
            <Button variant='solid' onClick={handleCreatePVButtonClick}>
              {t('button.createPVSystem')}
            </Button>
          )}
          {pvPoints.length > 0 && (
            <>
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
      <MenuRoot>
        <MenuTrigger>
          <Button variant='subtle' size='sm'>
            {t('button.more')}
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>
            <AdvertismentDialog />
          </MenuItem>
          <MenuItem>
            <OptionsDialog />
          </MenuItem>
          <MenuItem>
            <ControlHelperDialog />
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </OverlayWrapper>
  )
}
const NotificationForSelectedBuilding = ({
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
    <DialogRoot
      open={true}
      placement='bottom'
      size='xs'
      onInteractOutside={() => setSelectedMesh([])}
    >
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
          </SimpleGrid>
        </DialogBody>
        <DialogCloseTrigger onClick={() => setSelectedMesh([])} />
      </DialogContent>
    </DialogRoot>
  )
}

export default Overlay
