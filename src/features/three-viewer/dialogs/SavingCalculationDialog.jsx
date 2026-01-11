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
import {
  Accordion,
  Box,
  Collapsible,
  Heading,
  Link,
  List,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Dialog for calculating PV system savings based on consumption and storage.
 */
export const SavingCalculationDialog = () => {
  const { t } = useTranslation()
  const { pvSystems } = useContext(SceneContext)

  const [annualConsumption, setAnnualConsumption] = useState('3000')
  const [storageCapacity, setStorageCapacity] = useState('0')
  const [electricityPrice, setElectricityPrice] = useState('30')
  const [selfConsumption, setSelfConsumption] = useState(0)
  const [annualSavings, setAnnualSavings] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const selectedPVSystems = pvSystems.filter((system) => system.selected)
  const pvProduction =
    selectedPVSystems.length > 0
      ? Math.round(
          selectedPVSystems.reduce(
            (previous, current) => previous + current.annualYield,
            0,
          ),
        )
      : 0
  const items = [
    {
      value: 'a',
      title: t('adbox.companies.h'),
      text: t('adbox.companies.p'),
      linkText: 'https://www.sfv.de',
      href: 'https://www.sfv.de/solaranlagenberatung/sachverstaendige-1',
    },
    {
      value: 'b',
      title: t('adbox.balkonsolar.h'),
      text: t('adbox.balkonsolar.p'),
      linkText: 'https://balkon.solar',
      href: 'https://balkon.solar/montage/',
    },
    {
      value: 'c',
      title: t('adbox.bbe.h'),
      text: t('adbox.bbe.p'),
      linkText: 'https://www.buendnis-buergerenergie.de/',
      href: 'https://www.buendnis-buergerenergie.de/karte',
    },
  ]

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
    <DialogRoot size='lg'>
      <DialogTrigger asChild>
        <Button variant='subtle'>{t('savingsCalculation.button')}</Button>
      </DialogTrigger>
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
                color='fg.success'
                mt='4'
                bg='bg.success'
                rounded='md'
                shadow='md'
                border='border.success'
              >
                <Text>{t('savingsCalculation.disclaimer')}</Text>
                <br />
                <List.Root>
                  <List.Item>
                    {t('savingsCalculation.results.production')}
                    <Text as='b' color='fg.success'>
                      {pvProduction} kWh
                    </Text>
                  </List.Item>
                  <List.Item>
                    {t('savingsCalculation.results.consumption')}
                    <Text as='b' color='fg.success'>
                      {selfConsumption} kWh
                    </Text>
                  </List.Item>
                  <List.Item>
                    {t('savingsCalculation.results.savings')}
                    <Text as='b' color='fg.success'>
                      {annualSavings}€
                    </Text>
                  </List.Item>
                </List.Root>
              </Box>
              <br />
              <Box
                p='40px'
                color='fg.warning'
                mt='4'
                bg='bg.warning'
                rounded='md'
                shadow='md'
                border='border.warning'
              >
                <Heading>{t('adbox.title')}</Heading>
                <Text>{t('adbox.introduction')}</Text>
                <br />
                <Accordion.Root multiple>
                  {items.map((item, index) => (
                    <Accordion.Item key={index} value={item.value}>
                      <Accordion.ItemTrigger>
                        <Text as='b'> {item.title}</Text>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          {item.text}
                          <br />
                          <Link href={item.href}>{item.linkText}</Link>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
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
