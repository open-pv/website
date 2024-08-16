import { Button, Tooltip } from "@chakra-ui/react"
import React from "react"

export default function ButtonWithHoverHelp({
  buttonLabel,
  onClick,
  hoverText,
}) {
  return (
    <Tooltip label={hoverText}>
      <Button variant={"link"} colorScheme="teal" onClick={onClick}>
        {buttonLabel}
      </Button>
    </Tooltip>
  )
}
