function _optionalChain(ops) {
  let lastAccessLHS = undefined
  let value = ops[0]
  let i = 1
  while (i < ops.length) {
    const op = ops[i]
    const fn = ops[i + 1]
    i += 2
    if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
      return undefined
    }
    if (op === 'access' || op === 'optionalAccess') {
      lastAccessLHS = value
      value = fn(value)
    } else if (op === 'call' || op === 'optionalCall') {
      value = fn((...args) => value.call(lastAccessLHS, ...args))
      lastAccessLHS = undefined
    }
  }
  return value
}
import { Switch as ChakraSwitch } from '@chakra-ui/react'
import * as React from 'react'

export const Switch = React.forwardRef(function Switch(props, ref) {
  const { inputProps, children, rootRef, trackLabel, thumbLabel, ...rest } =
    props

  return (
    <ChakraSwitch.Root ref={rootRef} {...rest}>
      <ChakraSwitch.HiddenInput ref={ref} {...inputProps} />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb>
          {thumbLabel && (
            <ChakraSwitch.ThumbIndicator
              fallback={_optionalChain([
                thumbLabel,
                'optionalAccess',
                (_) => _.off,
              ])}
            >
              {_optionalChain([thumbLabel, 'optionalAccess', (_2) => _2.on])}
            </ChakraSwitch.ThumbIndicator>
          )}
        </ChakraSwitch.Thumb>
        {trackLabel && (
          <ChakraSwitch.Indicator fallback={trackLabel.off}>
            {trackLabel.on}
          </ChakraSwitch.Indicator>
        )}
      </ChakraSwitch.Control>
      {children != null && <ChakraSwitch.Label>{children}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  )
})
