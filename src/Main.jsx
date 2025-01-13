import { Box } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

import Navigation from './components/Template/Navigation'

const Main = (props) => (
  <HelmetProvider>
    <Helmet titleTemplate='%s | OpenPV' defaultTitle='OpenPV' defer={false}>
      {props.title && <title>{props.title}</title>}
      <meta name='description' content={props.description} />
      <meta name='Beschreibung' content={props.description} />
    </Helmet>
    <Layout>
      <Navigation />
      {props.children}
    </Layout>
  </HelmetProvider>
)

Main.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  fullPage: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
}

Main.defaultProps = {
  children: null,
  fullPage: false,
  title: null,
  description: 'Ermittle das Potential für eine Solaranlage.',
}

export default Main

const Layout = ({ children }) => {
  return (
    <Box
      as='div'
      display='flex'
      margin='0'
      maxWidth='100%'
      opacity={1}
      padding={0}
      width='100vw'
      height='100vh'
      position='fixed'
      left={0}
      top={0}
      flexDirection='column'
    >
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='space-between'
        minWidth={0}
        minHeight={0}
        overflow='hidden'
        flexGrow={1}
        width='100%'
        height='100%'
      >
        {children}
      </Box>
    </Box>
  )
}
