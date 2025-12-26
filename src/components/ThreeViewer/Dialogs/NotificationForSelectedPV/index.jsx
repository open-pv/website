import { Button } from '@/components/ui/button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { SimpleGrid } from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SceneContext } from '@/components/context'
import { SavingCalculationDialog } from './SavingCalculationDialog'

/**
 * Notification dialog shown when a PV system is selected.
 * Provides options to calculate savings or delete the system.
 */
export const NotificationForSelectedPV = () => {
  const { t } = useTranslation()
  const { setSelectedPVSystem, setPVSystems } = useContext(SceneContext)

  return (
    <DialogRoot
      open={true}
      placement='bottom'
      size='xs'
      onInteractOutside={() => setSelectedPVSystem([])}
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
                setPVSystems([])
                setSelectedPVSystem([])
              }}
            >
              {t('delete')}
            </Button>
          </SimpleGrid>
        </DialogBody>
        <DialogCloseTrigger onClick={() => setSelectedPVSystem([])} />
      </DialogContent>
    </DialogRoot>
  )
}
