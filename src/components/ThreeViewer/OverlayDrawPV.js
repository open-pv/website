import { Button } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { createPVSystem } from "./Meshes/PVSystems"

export default function OverlayDrawPV({
  setPVSystems,
  pvPoints,
  setPVPoints,
  setFrontendState,
  simulationMeshes,
}) {
  const { t } = useTranslation()
  const handleCreatePVButtonClick = () => {
    createPVSystem({
      setPVSystems,
      pvPoints,
      setPVPoints,
      simulationMeshes,
    })
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
