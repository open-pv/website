import { Link, Tabs } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const Navigation = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Tabs.Root navigate={({ value, node }) => navigate(`/${value}`)} size='lg'>
      <Tabs.List>
        <Tabs.Trigger value='/'>
          <Link unstyled href='/'>
            OpenPV
          </Link>
        </Tabs.Trigger>
        <Tabs.Trigger value='about'>
          <Link unstyled href='/about'>
            {t('about.title')}
          </Link>
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  )
}

export default Navigation
