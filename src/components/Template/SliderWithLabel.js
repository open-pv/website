import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react"
import React from "react"
import HoverHelp from "./HoverHelp"

const SliderWithLabel = ({ sliderProps, label, hoverHelpLabel }) => {
  const defaultValue = 100
  window.numSimulation = defaultValue
  const [sliderValue, setSliderValue] = React.useState(defaultValue)
  const [showTooltip, setShowTooltip] = React.useState(false)
  return (
    <>
      {label}

      {hoverHelpLabel && <HoverHelp label={hoverHelpLabel} />}
      <Slider
        id="slider"
        defaultValue={defaultValue}
        min={sliderProps.min}
        max={sliderProps.max}
        colorScheme="teal"
        onChange={(v) => {
          setSliderValue(v)
          window.numSimulations = v //TODO: A Slider might also change some other values
          // besides the numSimulation
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="teal.500"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={`${sliderValue}`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    </>
  )
}

export default SliderWithLabel
