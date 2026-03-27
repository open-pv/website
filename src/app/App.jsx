import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import AppLayout from '@/components/layout/AppLayout'
import Navigation from '@/components/layout/Navigation'

const App = ({
  children = null,
  title = null,
  description: descriptionProp = null,
}) => {
  const { t } = useTranslation()
  const description = descriptionProp || t('mainDescription')
  const ogTitle = title ? `${title} | OpenPV` : t('title')
  return (
    <HelmetProvider>
      <Helmet
        titleTemplate='%s | OpenPV'
        defaultTitle={t('title')}
        defer={false}
      >
        {title && <title>{title}</title>}
        <meta name='description' content={description} />
        <meta name='robots' content='index, follow' />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='OpenPV' />
        <meta property='og:title' content={ogTitle} />
        <meta property='og:description' content={description} />
        <meta
          property='og:image'
          content='https://openpv.de/images/favicon/android-chrome-512x512.png'
        />
        <meta name='twitter:card' content='summary' />
        <meta name='twitter:title' content={ogTitle} />
        <meta name='twitter:description' content={description} />
        <meta
          name='twitter:image'
          content='https://openpv.de/images/favicon/android-chrome-512x512.png'
        />
      </Helmet>
      <AppLayout>
        <Navigation />
        {children}
      </AppLayout>
    </HelmetProvider>
  )
}

export default App
