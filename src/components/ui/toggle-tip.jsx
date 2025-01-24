import { Popover as ChakraPopover, IconButton, Portal } from '@chakra-ui/react'
import * as React from 'react'
import { HiOutlineInformationCircle } from 'react-icons/hi'

export const ToggleTip = React.forwardRef(function ToggleTip(props, ref) {
  const {
    showArrow,
    children,
    portalled = true,
    content,
    portalRef,
    ...rest
  } = props

  return (
    <ChakraPopover.Root
      {...rest}
      positioning={{ ...rest.positioning, gutter: 4 }}
    >
      <ChakraPopover.Trigger asChild>{children}</ChakraPopover.Trigger>
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraPopover.Positioner>
          <ChakraPopover.Content
            width='auto'
            px='2'
            py='1'
            textStyle='xs'
            rounded='sm'
            ref={ref}
          >
            {showArrow && (
              <ChakraPopover.Arrow>
                <ChakraPopover.ArrowTip />
              </ChakraPopover.Arrow>
            )}
            {content}
          </ChakraPopover.Content>
        </ChakraPopover.Positioner>
      </Portal>
    </ChakraPopover.Root>
  )
})

export const InfoTip = React.forwardRef(function InfoTip(props, ref) {
  const { children, ...rest } = props
  return (
    <ToggleTip content={children} {...rest} ref={ref}>
      <IconButton
        variant='ghost'
        aria-label='info'
        size='2xs'
        colorPalette='gray'
      >
        <HiOutlineInformationCircle />
      </IconButton>
    </ToggleTip>
  )
})
