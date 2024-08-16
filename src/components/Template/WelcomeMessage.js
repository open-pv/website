import {
  Box,
  Button,
  Circle,
  Flex,
  Image,
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

function WelcomeMessageBoxElement({ image, text }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
    >
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          style={{ maxHeight: "200px", width: "auto", margin: "20px" }}
        />
      )}

      {text}
    </Box>
  )
}

function WelcomeMessage() {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const [currentPage, setCurrentPage] = useState(1)
  const { t, i18n } = useTranslation()

  const numPages = 4

  const nextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("WelcomeMessage.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {currentPage === 1 && (
            <WelcomeMessageBoxElement
              image={{
                src: "images/WelcomeMessage1.png",
                alt: "Screenshot from the Search Input, where some address is written down.",
              }}
              text={t("WelcomeMessage.firstPage")}
            />
          )}
          {currentPage === 2 && (
            <WelcomeMessageBoxElement
              image={{
                src: "images/WelcomeMessage2.png",
                alt: "Screenshot from a possible Simulation Result, where the solar potential of a 3D building is shown.",
              }}
              text={t("WelcomeMessage.secondPage")}
            />
          )}
          {currentPage === 3 && (
            <WelcomeMessageBoxElement
              image={{
                src: "images/WelcomeMessage3.png",
                alt: "Screenshot from a possible Simulation Result, where a PV system was created and the annual result was calculated.",
              }}
              text={t("WelcomeMessage.thirdPage")}
            />
          )}
          {currentPage === 4 && (
            <WelcomeMessageBoxElement text={t("WelcomeMessage.fourthPage")} />
          )}
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
            isDisabled={currentPage === numPages}
          >
            {t("next")}
          </Button>
        </ModalFooter>
        <Flex justifyContent="center" mb={4}>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
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
