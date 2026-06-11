import App from '@/app/App'
import { Button } from '@/components/ui/button'
import Footer from '@/components/layout/Footer'
import { Box, Card, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const NotFound = () => {
  const { t } = useTranslation()
  return (
    <>
      <App title={t('notFound.title')} robots='noindex, nofollow'>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexGrow={1}
          padding='20px'
        >
          <Card.Root
            maxWidth='480px'
            width='100%'
            padding='40px'
            textAlign='center'
          >
            <Card.Header>
              <Heading as='h1' size='4xl' color='gray.400'>
                {t('notFound.heading')}
              </Heading>
              <Heading as='h2' size='lg' marginTop='8px'>
                {t('notFound.title')}
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text color='gray.500' marginBottom='24px'>
                {t('notFound.description')}
              </Text>
              <Button asChild colorPalette='teal'>
                <Link to='/'>{t('notFound.backToHome')}</Link>
              </Button>
            </Card.Body>
          </Card.Root>
        </Box>
      </App>
      <Footer />
    </>
  )
}

export default NotFound
