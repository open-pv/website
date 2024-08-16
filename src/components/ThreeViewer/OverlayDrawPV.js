import { Button } from "@chakra-ui/react"
import React from "react"

export default function OverlayDrawPV({
  visiblePVSystems,
  setvisiblePVSystems,
}) {
  const handleCreatePVButtonClick = () => {
    const nextIndex = visiblePVSystems.length
    setvisiblePVSystems([...visiblePVSystems, nextIndex])
  }

  const handleAbortButtonClick = () => {
    window.setFrontendState("Results")
  }

  return (
    <>
      <Button
        onClick={handleCreatePVButtonClick}
        variant={"link"}
        colorScheme="teal"
      >
        {" "}
        PV-Anlage erstellen
      </Button>
      <Button
        onClick={handleAbortButtonClick}
        variant={"link"}
        colorScheme="teal"
      >
        Abbrechen
      </Button>
    </>
  )
}
