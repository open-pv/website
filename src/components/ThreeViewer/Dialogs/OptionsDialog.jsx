import { Switch } from '@/components/ui/switch'
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

/**
 * Options dialog for toggling terrain visibility.
 */
export const OptionsDialog = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation()
  const { showTerrain, setShowTerrain } = useContext(SceneContext)

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
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
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
