import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { List } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

/**
 * Dialog showing controls help for navigating the 3D scene.
 */
export const ControlHelperDialog = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation()
  const touchDeviceText = window.isTouchDevice ? 'touch.' : ''

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('mapControlHelp.title')}</DialogTitle>
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
          </List.Root>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
