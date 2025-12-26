import PropTypes from 'prop-types'
import React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import AppLayout from '@/components/layout/AppLayout'
import Navigation from '@/components/layout/Navigation'

const App = (props) => {
  const { t } = useTranslation()
  return (
    <HelmetProvider>
      <Helmet
        titleTemplate='%s | OpenPV'
        defaultTitle={t('title')}
        defer={false}
      >
        {props.title && <title>{props.title}</title>}
        <meta name='description' content={props.description} />
        <meta name='Beschreibung' content={props.description} />
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
  description: 'Ermittle das Potential für eine Solaranlage.',
}

export default App
