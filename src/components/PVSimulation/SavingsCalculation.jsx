import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

function SavingCalculation({
  selectedPVSystem,
  setSelectedPVSystem,
  onCloseAlert,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false })
  const { isOpen: isOpenResultFade, onToggle: onToggleResultFade } =
    useDisclosure({ defaultIsOpen: false })
  const { t } = useTranslation()
  const [annualConsumption, setAnnualConsumption] = useState(3000)
  const [storageCapacity, setStorageCapacity] = useState(0)
  const [electricityPrice, setElectricityPrice] = useState(25)
  const [selfConsumption, setSelfConsumption] = useState(0)
  const [annualSavings, setAnnualSavings] = useState(0)
  let pvProduction
  if (selectedPVSystem.length > 0) {
    pvProduction = Math.round(
      selectedPVSystem.reduce(
        (previous, current) => previous + current.geometry.annualYield,
        0
      )
    )
  }

  async function handleCalculateSaving() {
    async function calculateSaving({
      pvProduction,
      consumptionHousehold,
      storageCapacity,
      electricityPrice,
      setSelfConsumption,
      setAnnualSavings,
    }) {
      const response = await fetch(
        "https://www.openpv.de/data/savings_calculation/cons_prod.json"
      )
      const data = await response.json()

      const normalizedConsumption = data["Consumption"]
      const normalizedProduction = data["Production"]

      const result = {}
      let currentStorageLevel = 0
      for (const timestamp in normalizedConsumption) {
        const consumptionValue =
          (normalizedConsumption[timestamp] * consumptionHousehold) / 1000
        const productionValue =
          (normalizedProduction[timestamp] * pvProduction) / 1000

        let selfConsumption = 0
        let excessProduction = 0

        if (productionValue > consumptionValue) {
          selfConsumption = consumptionValue
          excessProduction = productionValue - consumptionValue

          // Charge the storage
          const availableStorageSpace = storageCapacity - currentStorageLevel
          const chargedAmount = Math.min(
            excessProduction,
            availableStorageSpace
          )
          currentStorageLevel += chargedAmount
        } else {
          const productionDeficit = consumptionValue - productionValue

          // Use storage if available
          const usedFromStorage = Math.min(
            productionDeficit,
            currentStorageLevel
          )
          currentStorageLevel -= usedFromStorage

          selfConsumption = productionValue + usedFromStorage
        }

        result[timestamp] = selfConsumption
      }

      let selfConsumedElectricity = Object.values(result).reduce(
        (acc, val) => acc + val,
        0
      )

      setSelfConsumption(Math.round(selfConsumedElectricity))
      setAnnualSavings(
        Math.round((selfConsumedElectricity * electricityPrice) / 100)
      )
    }

    await calculateSaving({
      pvProduction: pvProduction,
      consumptionHousehold: parseFloat(annualConsumption),
      storageCapacity: storageCapacity,
      electricityPrice: electricityPrice,
      setSelfConsumption: setSelfConsumption,
      setAnnualSavings: setAnnualSavings,
    })
  }

  const initialRef = React.useRef(null)

  return (
    <>
      {selectedPVSystem.length > 0 && (
        <Button
          colorScheme="teal"
          onClick={() => {
            onOpen()
          }}
        >
          {t("savingsCalculation.button")}
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose()
          onCloseAlert()
          setSelectedPVSystem([])
        }}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("savingsCalculation.button")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <>
              <FormControl>
                <FormLabel>
                  {t("savingsCalculation.consumptionTitle")}
                  <Tooltip
                    label={t("savingsCalculation.consumptionHelperInfo")}
                  >
                    <Text color="teal" fontSize="xs">
                      {t("savingsCalculation.consumptionHelperLabel")}
                    </Text>
                  </Tooltip>
                </FormLabel>
                <Input
                  ref={initialRef}
                  value={annualConsumption}
                  onChange={(e) => setAnnualConsumption(e.target.value)}
                />
              </FormControl>
              <br />
              <FormControl>
                <FormLabel>{t("savingsCalculation.storageTitle")}</FormLabel>
                <Input
                  ref={initialRef}
                  value={storageCapacity}
                  onChange={(e) => setStorageCapacity(e.target.value)}
                />
              </FormControl>
              <br />
              <FormControl>
                <FormLabel>
                  {t("savingsCalculation.electricityPriceTitle")}
                </FormLabel>
                <Input
                  ref={initialRef}
                  placeholder={t(
                    "savingsCalculation.electricityPricePlaceholder"
                  )}
                  value={electricityPrice}
                  onChange={(e) => setElectricityPrice(e.target.value)}
                />
              </FormControl>

              <Collapse in={isOpenResultFade} animateOpacity>
                <Box
                  p="40px"
                  color="white"
                  mt="4"
                  bg="teal"
                  rounded="md"
                  shadow="md"
                >
                  <Text>{t("savingsCalculation.disclaimer")}</Text>
                  <UnorderedList>
                    <ListItem>
                      {t("savingsCalculation.results.production")}
                      <Text as="b" color={"white"}>
                        {pvProduction} kWh
                      </Text>
                    </ListItem>
                    <ListItem>
                      {t("savingsCalculation.results.consumption")}
                      <Text as="b" color={"white"}>
                        {selfConsumption} kWh
                      </Text>
                    </ListItem>
                    <ListItem>
                      {t("savingsCalculation.results.savings")}
                      <Text as="b" color={"white"}>
                        {annualSavings}€
                      </Text>
                    </ListItem>
                  </UnorderedList>
                </Box>
              </Collapse>

              <br />
            </>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                handleCalculateSaving()
                if (!isOpenResultFade) {
                  //open the Fade only if it is not
                  // already opened
                  onToggleResultFade()
                }
              }}
            >
              {t("savingsCalculation.calculate")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SavingCalculation
