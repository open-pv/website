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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Box, List, SimpleGrid } from '@chakra-ui/react'
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

  return (
    <OverlayWrapper>
      <ControlHelperDialog />
      {frontendState == 'Results' && (
        <>
          <OptionsDialog />
          <Button
            onClick={() => {
              setFrontendState('DrawPV')
              onCloseDrawer()
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
            <List.Item>{t(`mapControlHelp.${touchDeviceText}wheel`)}</List.Item>
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

export default Overlay
