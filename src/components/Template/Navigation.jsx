import { Link, Tabs } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

const Navigation = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <Tabs.Root value={isActive('/about') ? '/about' : '/'}>
      <Tabs.List bg='bg.muted' rounded='l3'>
        <Tabs.Trigger value='/'>
          <Link textStyle='xl' href='/'>
            OpenPV
          </Link>
        </Tabs.Trigger>
        <Tabs.Trigger value='/about'>
          <Link unstyled href='/about'>
            {t('about.title')}
          </Link>
        </Tabs.Trigger>
        <Tabs.Trigger value='blog'>
          <Link unstyled href='https://blog.openpv.de'>
            {t('navigation.products')}
          </Link>
        </Tabs.Trigger>
        <Tabs.Indicator rounded='l2' />
      </Tabs.List>
    </Tabs.Root>
  )
}

export default Navigation
