import { ColorModeButton } from '@/components/ui/color-mode'
import {
  Box,
  Flex,
  IconButton,
  Link,
  Menu,
  Portal,
  Tabs,
} from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuMenu } from 'react-icons/lu'
import { useLocation } from 'react-router-dom'

const Navigation = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <Flex align='center' px='2'>
      {/* Desktop navigation */}
      <Box hideBelow='md'>
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
      </Box>

      {/* Mobile logo */}
      <Box hideFrom='md'>
        <Link textStyle='xl' href='/'>
          OpenPV
        </Link>
      </Box>

      {/* Desktop color mode button */}
      <Box ml='auto' hideBelow='md'>
        <ColorModeButton />
      </Box>

      {/* Mobile controls */}
      <Flex ml='auto' gap='1' hideFrom='md'>
        <ColorModeButton />
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton variant='outline' size='sm' aria-label='Open menu'>
              <LuMenu />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value='start' asChild>
                  <Link unstyled href='/'>
                    {'Start'}
                  </Link>
                </Menu.Item>
                <Menu.Item value='about' asChild>
                  <Link unstyled href='/about'>
                    {t('about.title')}
                  </Link>
                </Menu.Item>
                <Menu.Item value='blog' asChild>
                  <Link unstyled href='https://blog.openpv.de'>
                    {t('navigation.products')}
                  </Link>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  )
}

export default Navigation
