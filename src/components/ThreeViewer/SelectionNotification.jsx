import {
  Alert,
  AlertDescription,
  Box,
  Button,
  CloseButton,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import React, { useEffect, useRef } from "react"

const SelectionNotification = ({ selection, setSelection, buttons }) => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const hasShownAlertRef = useRef(false)

  useEffect(() => {
    if (selection.length > 0 && !hasShownAlertRef.current) {
      onOpen()
      hasShownAlertRef.current = true
    }
  }, [selection, onOpen])

  const handleCloseAlert = () => {
    onClose()
    setSelection([])
    hasShownAlertRef.current = false
  }

  const handleButtonClick = (action) => {
    // Call the button's action if provided
    if (action) {
      action()
    }
    handleCloseAlert()
  }

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      width="300px"
      zIndex={9999}
    >
      <Alert alignItems="start" boxShadow="md" rounded="md" colorScheme="teal">
        <Box width="100%">
          <AlertDescription display="block" mb={2}>
            We've created your account for you.
          </AlertDescription>
          <Wrap spacing={2} justify="start">
            {buttons.map((button, index) => (
              <WrapItem key={index}>
                <Button
                  size="sm"
                  onClick={() => handleButtonClick(button.action)}
                >
                  {button.label}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
        <CloseButton
          position="absolute"
          right={1}
          top={1}
          onClick={handleCloseAlert}
        />
      </Alert>
    </Box>
  )
}

export default SelectionNotification
