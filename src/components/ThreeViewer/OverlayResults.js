import { Button, FormLabel, Switch } from "@chakra-ui/react"
import React from "react"
import HoverHelp from "../Template/HoverHelp"

export default function OverlayResults({
  setFrontendState,
  showTerrain,
  setShowTerrain,
  onCloseDrawer,
}) {
  return (
    <>
      <Button
        variant={"link"}
        _hover={{ color: "blue.500" }}
        onClick={() => {
          setFrontendState("DrawPV")
          onCloseDrawer()
        }}
      >
        PV Anlage einzeichnen
      </Button>
      <HoverHelp
        label={"PV-Anlage in der Karte einzeichnen und Jahresbetrag berechnen."}
      />

      <FormLabel>
        Karte anzeigen
        <Switch
          isChecked={showTerrain}
          onChange={() => setShowTerrain((prev) => !prev)}
          colorScheme="teal" // You can change the color scheme as needed
          margin={"5px"}
        />
      </FormLabel>
    </>
  )
}
