import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Box, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generateColorGradient } from '../utils/colorMapUtils'

/**
 * Color legend dialog showing the yield color scale.
 */
export const ColorLegend = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation()
  const gradient = generateColorGradient()

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('colorLegend.button')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack spacing={4}>
            <Box>
              <Box display='flex' justifyContent='space-between' px={1}>
                <Text fontSize='sm'>{t('colorLegend.description')}</Text>
              </Box>
              <Box display='flex' justifyContent='space-between' px={1}>
                <Text fontSize='sm'>0</Text>
                <Text fontSize='sm'>500</Text>
                <Text fontSize='sm'>1150</Text>
              </Box>
              <Box
                id='colorLegend'
                h='20px'
                w='300px'
                borderRadius='md'
                style={{
                  background: `linear-gradient(to right, ${gradient})`,
                }}
              />
            </Box>
          </VStack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
