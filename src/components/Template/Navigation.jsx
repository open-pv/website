import { Link, Tabs } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Navigation = () => {
  const { t } = useTranslation()

  return (
    <Tabs.Root defaultValue='openpv' size='lg'>
      <Tabs.List>
        <Tabs.Trigger value='openpv'>
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
