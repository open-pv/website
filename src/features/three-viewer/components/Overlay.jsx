import { Button } from '@/components/ui/button'
import { MouseHoverInfo } from '@/features/three-viewer/components/MouseHoverInfo'
import { OverlayWrapper } from '@/features/three-viewer/components/OverlayWrapper'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import {
  AdvertismentDialog,
  ColorLegend,
  ControlHelperDialog,
  OptionsDialog,
  SavingCalculationDialog,
} from '@/features/three-viewer/dialogs'
import { createPVSystem } from '@/features/three-viewer/meshes/PVSystems'
import { Box, Menu } from '@chakra-ui/react'
import { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

function Overlay({ frontendState, setFrontendState }) {
  const sceneContext = useContext(SceneContext)
  const { t } = useTranslation()
  const handleCreatePVButtonClick = () => {
    createPVSystem({
      setPVSystems: sceneContext.setPVSystems,
      pvPoints: sceneContext.pvPoints,
      setPVPoints: sceneContext.setPVPoints,
      simulatedBuildings: sceneContext.buildings.filter(
        (b) => b.type === 'simulation',
      ),
    })
    setFrontendState('Results')
  }
  // Dialog state management
  const [isOpenOptionsDialog, setIsOpenOptionsDialog] = useState(false)
  const [isOpenControlHelp, setIsOpenControlHelp] = useState(false)
  const [isOpenAdvertisment, setIsOpenAdvertisment] = useState(false)
  const [isOpenSavingCalculation, setIsOpenSavingCalculation] = useState(false)

  // Track PV system count to detect when new ones are created
  const previousPVCountRef = useRef(sceneContext.pvSystems.length)

  useEffect(() => {
    const currentCount = sceneContext.pvSystems.length
    if (currentCount > previousPVCountRef.current) {
      // New PV system was added, open the dialog
      setIsOpenSavingCalculation(true)
    }
    previousPVCountRef.current = currentCount
  }, [sceneContext.pvSystems.length])

  return (
    <>
      <Box
        position='fixed'
        bottom='16px'
        right='16px'
        display='flex'
        flexDirection='column'
        zIndex={9999}
        pointerEvents='none'
        backgroundColor='rgba(245, 245, 245, 0.92)'
        borderRadius='8px'
        boxShadow='0 2px 8px rgba(0, 0, 0, 0.2)'
        padding='8px 12px'
        width={window.isTouchDevice ? 'fit-content' : '220px'}
      >
        {!window.isTouchDevice && (
          <>
            <MouseHoverInfo />
            <Box borderTop='1px solid rgba(0,0,0,0.12)' my='4px' />
          </>
        )}
        <ColorLegend />
      </Box>
      <OverlayWrapper>
        {frontendState === 'Results' && (
          <Button variant='subtle' onClick={() => setFrontendState('DrawPV')}>
            {t('button.drawPVSystem')}
          </Button>
        )}

        {frontendState === 'DrawPV' && (
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
              <Button
                variant='subtle'
                onClick={() => {
                  sceneContext.setPVPoints(sceneContext.pvPoints.slice(0, -1))
                }}
              >
                {t('button.deleteLastPoint')}
              </Button>
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
          </Menu.Content>
        </Menu.Root>

        {/* Dialog Components */}
        <SavingCalculationDialog
          isOpen={isOpenSavingCalculation}
          onOpenChange={(e) => setIsOpenSavingCalculation(e.open)}
        />
        <AdvertismentDialog
          isOpen={isOpenAdvertisment}
          onOpenChange={(e) => setIsOpenAdvertisment(e.open)}
        />
        <OptionsDialog
          isOpen={isOpenOptionsDialog}
          onOpenChange={(e) => setIsOpenOptionsDialog(e.open)}
        />
        <ControlHelperDialog
          isOpen={isOpenControlHelp}
          onOpenChange={(e) => setIsOpenControlHelp(e.open)}
        />
      </OverlayWrapper>
    </>
  )
}

export default Overlay
