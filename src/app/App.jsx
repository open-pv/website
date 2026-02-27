import PropTypes from 'prop-types'
import React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import AppLayout from '@/components/layout/AppLayout'
import Navigation from '@/components/layout/Navigation'

const App = (props) => {
  const { t } = useTranslation()
  const description = props.description || t('mainDescription')
  const ogTitle = props.title ? `${props.title} | OpenPV` : t('title')
  return (
    <HelmetProvider>
      <Helmet
        titleTemplate='%s | OpenPV'
        defaultTitle={t('title')}
        defer={false}
      >
        {props.title && <title>{props.title}</title>}
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
        {props.children}
      </AppLayout>
    </HelmetProvider>
  )
}

App.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  fullPage: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
}

App.defaultProps = {
  children: null,
  fullPage: false,
  title: null,
  description: null,
}

export default App
