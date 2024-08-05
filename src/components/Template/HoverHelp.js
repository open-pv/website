import { Icon, Tooltip } from "@chakra-ui/react"
import React from "react"

function HoverHelp({ label }) {
  return (
    <Tooltip label={label}>
      <Icon as="InfoOutlineIcon" margin={"5px"} />
    </Tooltip>
  )
}

export default HoverHelp
