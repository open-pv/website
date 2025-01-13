import { Tab, TabList, Tabs } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <Tabs
      as='nav'
      className='links'
      index={isActive('/') ? 0 : isActive('/about') ? 1 : -1}
    >
      <TabList>
        <Tab
          key='/'
          as={Link}
          to='/'
          isSelected={isActive('/')}
          fontSize='xl'
          fontWeight='bold'
          p={4}
        >
          OpenPV
        </Tab>
        <Tab key='/about' as={Link} to='/about' isSelected={isActive('/about')}>
          {t('about.title')}
        </Tab>
      </TabList>
    </Tabs>
  )
}

export default Navigation
