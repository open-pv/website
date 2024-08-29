import { Button } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export default function OverlayDrawPV({
  visiblePVSystems,
  setvisiblePVSystems,
  pvPoints,
  setPVPoints,
  setFrontendState,
}) {
  const { t } = useTranslation()
  const handleCreatePVButtonClick = () => {
    const nextIndex = visiblePVSystems.length
    setvisiblePVSystems([...visiblePVSystems, nextIndex])
    setFrontendState("Results")
  }

  const handleAbortButtonClick = () => {
    setFrontendState("Results")
  }

  return (
    <>
      <Button
        onClick={handleCreatePVButtonClick}
        variant={"link"}
        colorScheme="teal"
      >
        {" "}
        {t("button.createPVSystem")}
      </Button>
      {pvPoints.length > 0 && (
        <Button
          variant={"link"}
          colorScheme="teal"
          onClick={() => {
            setPVPoints(pvPoints.slice(0, -1))
          }}
        >
          {t("button.deleteLastPoint")}
        </Button>
      )}
      <Button
        onClick={handleAbortButtonClick}
        variant={"link"}
        colorScheme="teal"
      >
        {t("button.cancel")}
      </Button>
    </>
  )
}
