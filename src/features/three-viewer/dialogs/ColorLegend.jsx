import { generateColorGradient } from '@/features/three-viewer/utils/colorMapUtils'
import { Box, Text } from '@chakra-ui/react'

/**
 * Color legend overlay showing the yield color scale.
 */
export const ColorLegend = () => {
  const gradient = generateColorGradient()

  return (
    <div className='color-legend'>
      <Box display='flex' justifyContent='space-between'>
        <Text>0 kWh/kWp</Text>
        <Text>500</Text>
        <Text>1100</Text>
      </Box>
      <Box
        id='colorLegend'
        h='12px'
        w='150px'
        borderRadius='md'
        style={{
          background: `linear-gradient(to right, ${gradient})`,
        }}
      />
    </div>
  )
}
