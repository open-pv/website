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
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import HoverHelp from "../Template/HoverHelp"

function SavingCalculation({ pvSystems }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false })
  const { t } = useTranslation()
  const [annualConsumption, setAnnualConsumption] = useState("")
  const [storageCapacity, setStorageCapacity] = useState("")
  const [electricityPrice, setElectricityPrice] = useState(0.25)
  const [selfConsumption, setSelfConsumption] = useState(0)
  const [annualSavings, setAnnualSavings] = useState(0)
  let pvProduction
  console.log("pvSystems", pvSystems)
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

      console.log(
        selfConsumedElectricity,
        "kWh are self consumed in the household"
      )

      setSelfConsumption(Math.round(selfConsumedElectricity))
      setAnnualSavings(Math.round(selfConsumedElectricity * electricityPrice))
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
          Wirtschaftlichkeit der Anlage berechnen
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{"Wirtschaftlichkeit berechnen"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <>
              <FormControl>
                <FormLabel>
                  Jährlicher Stromverbrauch{" "}
                  <HoverHelp
                    label={
                      "Schätzwert: Pro Person im Haushalt 800kWh, Wärmepumpe 2000 kWh, Elektroauto 2000 kWh"
                    }
                  />
                </FormLabel>
                <Input
                  ref={initialRef}
                  placeholder="Jährlicher Stromverbrauch in kWh"
                  value={annualConsumption}
                  onChange={(e) => setAnnualConsumption(e.target.value)}
                />
              </FormControl>
              <br />
              <FormControl>
                <FormLabel>Stromspeicher</FormLabel>
                <Input
                  ref={initialRef}
                  placeholder="Speicherkapazität in kWh"
                  value={storageCapacity}
                  onChange={(e) => setStorageCapacity(e.target.value)}
                />
              </FormControl>
              <br />
              <FormControl>
                <FormLabel>Preis pro kWh in €</FormLabel>
                <Input
                  ref={initialRef}
                  placeholder="Preis pro kWh in €"
                  value={electricityPrice}
                  onChange={(e) => setElectricityPrice(e.target.value)}
                />
              </FormControl>

              <br />
              <UnorderedList>
                <ListItem>
                  Jährliche Stromerzeugung durch PV: {pvProduction} kWh
                </ListItem>
                <ListItem>Eigenverbrauch: {selfConsumption} kWh</ListItem>
                <ListItem>Jährliche Einsparungen: {annualSavings} €</ListItem>
              </UnorderedList>
            </>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCalculateSaving}>
              Berechnen
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SavingCalculation
