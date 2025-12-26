import { DataListItem, DataListRoot } from '@/components/ui/data-list'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'

/**
 * Dialog showing useful links for solar installation resources.
 */
export const AdvertismentDialog = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation()

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
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
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
