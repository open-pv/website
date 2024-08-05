import {
  Box,
  Button,
  Circle,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

function WelcomeMessage() {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const [currentPage, setCurrentPage] = useState(1)
  const { t, i18n } = useTranslation()

  const nextPage = () => {
    if (currentPage < 3) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("WelcomeMessage.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {currentPage === 1 && <Box>{t("WelcomeMessage.firstPage")}</Box>}
          {currentPage === 2 && <Box>Second Page Content</Box>}
          {currentPage === 3 && <Box>Third Page Content</Box>}
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={prevPage}
            isDisabled={currentPage === 1}
          >
            {t("previous")}
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={nextPage}
            isDisabled={currentPage === 3}
          >
            {t("next")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
        <Flex justifyContent="center" mb={4}>
          {[1, 2, 3].map((page) => (
            <Circle
              key={page}
              size="10px"
              bg={currentPage === page ? "blue.500" : "gray.300"}
              m={1}
            />
          ))}
        </Flex>
      </ModalContent>
    </Modal>
  )
}

export default WelcomeMessage
