import { Button, Tooltip } from "@chakra-ui/react"
import React from "react"

export default function ButtonWithHoverHelp({
  buttonLabel,
  onClick,
  hoverText,
  className,
}) {
  return (
    <Tooltip label={hoverText}>
      <Button onClick={onClick} className={className}>
        {buttonLabel}
      </Button>
    </Tooltip>
  )
}
