import {
  Button,
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

function SavingCalculation({ pvSystems }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false })
  const { t } = useTranslation()
  const [annualConsumption, setAnnualConsumption] = useState("")
  const [storageCapacity, setStorageCapacity] = useState("")
  const [electricityPrice, setElectricityPrice] = useState(25)
  const [selfConsumption, setSelfConsumption] = useState(0)
  const [annualSavings, setAnnualSavings] = useState(0)
  let pvProduction
  if (pvSystems.length > 0) {
    pvProduction = Math.round(
      pvSystems.reduce((previous, current) => previous + current.annualYield, 0)
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
      {pvSystems.length > 0 && (
        <Button onClick={onOpen} className="button-high-prio">
          {t("savingsCalculation.button")}
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
                  placeholder={t("savingsCalculation.consumptionPlaceholder")}
                  value={annualConsumption}
                  onChange={(e) => setAnnualConsumption(e.target.value)}
                />
              </FormControl>
              <br />
              <FormControl>
                <FormLabel>{t("savingsCalculation.storageTitle")}</FormLabel>
                <Input
                  ref={initialRef}
                  placeholder={t("savingsCalculation.storagePlaceholder")}
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

              <br />
              <Text>{t("savingsCalculation.disclaimer")}</Text>
              <UnorderedList>
                <ListItem>
                  {t("savingsCalculation.results.production")}
                  {pvProduction} kWh
                </ListItem>
                <ListItem>
                  {t("savingsCalculation.results.consumption")}{" "}
                  {selfConsumption} kWh
                </ListItem>
                <ListItem>
                  {t("savingsCalculation.results.savings")} {annualSavings} €
                </ListItem>
              </UnorderedList>
            </>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={handleCalculateSaving}>
              {t("savingsCalculation.calculate")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SavingCalculation
