import { Box } from '@chakra-ui/react'
import React from 'react'

const AppLayout = ({ children }) => {
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

export default AppLayout
