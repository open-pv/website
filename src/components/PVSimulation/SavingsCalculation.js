import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Circle,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  useDisclosure,
} from "@chakra-ui/react"

import React, { useState } from "react"
import { useTranslation } from "react-i18next"

function SavingCalculation() {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const [currentPage, setCurrentPage] = useState(1)
  const { t, i18n } = useTranslation()

  const calculateSaving = () => {
    console.log("Savings")
  }
  const initialRef = React.useRef(null)
  const finalRef = React.useRef(null)
  const [value, setValue] = React.useState("1")

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"Wirtschaftlichkeit berechnen"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <>
            <FormControl>
              <FormLabel>Jährlicher Stromverbrauch</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Jährlicher Stromverbrauch in kWh"
              />
            </FormControl>
            <br />
            Wann verbrauche ich meinen Strom?
            <RadioGroup onChange={setValue} value={value} colorScheme="teal">
              <Stack direction="column">
                <Radio value="1">Morgens und Abends</Radio>
                <Radio value="2">Morgens, Mittags und Abends</Radio>
              </Stack>
            </RadioGroup>
            <br />
            Ich besitze oder plane den Kauf
            <Stack spacing={5} direction="row">
              <Checkbox colorScheme="teal">einer Wärmepumpe</Checkbox>
              <Checkbox colorScheme="teal">eines Elektroautos</Checkbox>
            </Stack>
          </>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={calculateSaving}>
            Berechnen
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SavingCalculation
