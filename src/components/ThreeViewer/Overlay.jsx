import { Button } from '@/components/ui/button'
import { Menu } from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SceneContext } from '../context'
import { createPVSystem } from './Meshes/PVSystems'
import { OverlayWrapper } from './components/OverlayWrapper'
import { MouseHoverInfo } from './components/MouseHoverInfo'
import {
  OptionsDialog,
  ColorLegend,
  ControlHelperDialog,
  AdvertismentDialog,
  NotificationForSelectedPV,
} from './Dialogs'

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
  // Dialog state management
  const [isOpenOptionsDialog, setIsOpenOptionsDialog] = useState(false)
  const [isOpenColorLegend, setIsOpenColorLegend] = useState(false)
  const [isOpenControlHelp, setIsOpenControlHelp] = useState(false)
  const [isOpenAdvertisment, setIsOpenAdvertisment] = useState(false)

  return (
    <>
      {!window.isTouchDevice && <MouseHoverInfo />}
      <OverlayWrapper>
        {sceneContext.selectedPVSystem.length > 0 && (
          <NotificationForSelectedPV />
        )}

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
            <Menu.Item
              value='legend'
              onClick={() => setIsOpenColorLegend(true)}
            >
              {t('colorLegend.button')}
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>

        {/* Dialog Components */}
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
        <ColorLegend
          isOpen={isOpenColorLegend}
          onOpenChange={(e) => setIsOpenColorLegend(e.open)}
        />
      </OverlayWrapper>
    </>
  )
}

export default Overlay
