import { Card, Link } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

function WrongAdress() {
  const { t } = useTranslation()
  return (
    <Card.Root>
      <Card.Body gap='2'>
        <Card.Title mt='2'>{t('errorMessage.header')}</Card.Title>
        <Card.Description>{t('errorMessage.wrongAdress')}</Card.Description>
        <Card.Description>
          <Link href='/' variant='underline'>
            {t('errorMessage.backToMap')}
          </Link>
        </Card.Description>
      </Card.Body>
    </Card.Root>
  )
}

export default WrongAdress
