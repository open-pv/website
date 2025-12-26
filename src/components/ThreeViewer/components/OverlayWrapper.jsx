import { Box } from '@chakra-ui/react'

/**
 * Wrapper for the buttons shown on top of the Scene.
 * Controls the size, order, and alignment of these buttons.
 */
export const OverlayWrapper = ({ children }) => {
  return (
    <Box display='flex' pointerEvents='none' zIndex={100} overflow='hidden'>
      <Box
        display='flex'
        flexDirection='row'
        flexWrap='wrap'
        gap='10px'
        padding='10px'
        height='fit-content'
        overflow='hidden'
        pointerEvents='auto'
        sx={{
          button: {
            minWidth: '100px',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
