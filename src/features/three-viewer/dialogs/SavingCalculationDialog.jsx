import { Button } from '@/components/ui/button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { NumberInputField, NumberInputRoot } from '@/components/ui/number-input'
import { calculateSavings } from '@/features/simulation/components/savingsCalculator'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import { Box, Collapsible, List, SimpleGrid, Text } from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Dialog for calculating PV system savings based on consumption and storage.
 */
export const SavingCalculationDialog = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation()
  const { pvSystems } = useContext(SceneContext)

  const [annualConsumption, setAnnualConsumption] = useState('3000')
  const [storageCapacity, setStorageCapacity] = useState('0')
  const [electricityPrice, setElectricityPrice] = useState('30')
  const [selfConsumption, setSelfConsumption] = useState(0)
  const [annualSavings, setAnnualSavings] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Reset showResults when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setShowResults(false)
    }
  }, [isOpen])

  const pvProduction =
    pvSystems.length > 0
      ? Math.round(
          pvSystems.reduce(
            (previous, current) => previous + current.annualYield,
            0,
          ),
        )
      : 0

  const handleCalculateSaving = async () => {
    await calculateSavings({
      pvProduction,
      consumptionHousehold: annualConsumption,
      storageCapacity,
      electricityPrice,
      setSelfConsumption,
      setAnnualSavings,
    })
    setShowResults(true)
  }

  return (
    <DialogRoot size='lg' open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('savingsCalculation.button')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t('savingsCalculation.disclaimer')}</p>
          <br />
          <SimpleGrid
            columns={1}
            columnGap='2'
            rowGap='4'
            justifyContent='center'
            alignItems='center'
          >
            <Field
              label={t('savingsCalculation.consumptionTitle')}
              helperText={t('savingsCalculation.consumptionHelperInfo')}
            >
              <NumberInputRoot
                value={annualConsumption}
                onValueChange={(e) => setAnnualConsumption(e.value)}
              >
                <NumberInputField />
              </NumberInputRoot>
            </Field>

            <Field label={t('savingsCalculation.storageTitle')}>
              <NumberInputRoot
                maxW='200px'
                value={storageCapacity}
                onValueChange={(e) => setStorageCapacity(e.value)}
              >
                <NumberInputField />
              </NumberInputRoot>
            </Field>

            <Field label={t('savingsCalculation.electricityPriceTitle')}>
              <NumberInputRoot
                maxW='200px'
                value={electricityPrice}
                onValueChange={(e) => setElectricityPrice(e.value)}
              >
                <NumberInputField />
              </NumberInputRoot>
            </Field>
          </SimpleGrid>

          <Collapsible.Root open={showResults}>
            <Collapsible.Content>
              <Box
                p='40px'
                color='white'
                mt='4'
                bg='teal'
                rounded='md'
                shadow='md'
              >
                <Text>{t('savingsCalculation.disclaimer')}</Text>
                <br />
                <List.Root>
                  {pvSystems.length > 1 && (
                    <List.Item>
                      <Text as='b' color='white'>
                        {pvSystems.length}{' '}
                        {t('savingsCalculation.results.pvsystems')}:
                      </Text>
                      <List.Root mt='2' ml='4'>
                        {pvSystems.map((system, index) => (
                          <List.Item key={system.id}>
                            System {index + 1}: {Math.round(system.annualYield)}{' '}
                            kWh/year ({system.totalArea.toPrecision(3)}m²)
                          </List.Item>
                        ))}
                      </List.Root>
                    </List.Item>
                  )}
                  <List.Item>
                    {t('savingsCalculation.results.production')}
                    <Text as='b' color='white'>
                      {pvProduction} kWh
                    </Text>
                  </List.Item>
                  <List.Item>
                    {t('savingsCalculation.results.consumption')}
                    <Text as='b' color='white'>
                      {selfConsumption} kWh
                    </Text>
                  </List.Item>
                  <List.Item>
                    {t('savingsCalculation.results.savings')}
                    <Text as='b' color='white'>
                      {annualSavings}€
                    </Text>
                  </List.Item>
                </List.Root>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </DialogBody>
        <DialogFooter>
          <Button variant='subtle' mr={3} onClick={handleCalculateSaving}>
            {t('savingsCalculation.calculate')}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
