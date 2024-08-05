import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  FormLabel,
  Switch,
} from "@chakra-ui/react"
import React from "react"
import HoverHelp from "../Template/HoverHelp"
import SliderWithLabel from "../Template/SliderWithLabel"

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
      <Accordion defaultIndex={[]}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Weitere Optionen
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <SliderWithLabel
              sliderProps={{ min: 1, max: 200 }}
              label={"Anzahl Simulationen"}
              hoverHelpLabel={"Hi"}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  )
}
