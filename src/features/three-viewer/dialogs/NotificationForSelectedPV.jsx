import { Button } from '@/components/ui/button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import { SimpleGrid } from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SavingCalculationDialog } from './SavingCalculationDialog'

/**
 * Notification dialog shown when a PV system is selected.
 * Provides options to calculate savings or delete the system.
 */
export const NotificationForSelectedPV = () => {
  const { t } = useTranslation()
  const { setPVSystems } = useContext(SceneContext)

  const deselectAll = () => {
    setPVSystems((prevSystems) =>
      prevSystems.map((system) => ({ ...system, selected: false })),
    )
  }

  const deleteSelected = () => {
    setPVSystems((prevSystems) =>
      prevSystems.filter((system) => !system.selected),
    )
  }

  return (
    <DialogRoot
      open={true}
      placement='bottom'
      size='xs'
      onInteractOutside={deselectAll}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('savingsCalculation.notificationLabel')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <SimpleGrid gap='5px'>
            <SavingCalculationDialog />
            <Button variant='subtle' onClick={deleteSelected}>
              {t('delete')}
            </Button>
          </SimpleGrid>
        </DialogBody>
        <DialogCloseTrigger onClick={deselectAll} />
      </DialogContent>
    </DialogRoot>
  )
}
