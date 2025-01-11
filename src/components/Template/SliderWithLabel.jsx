import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from '@chakra-ui/react'
import React from 'react'
import HoverHelp from './HoverHelp'

const SliderWithLabel = ({
  sliderProps,
  label,
  hoverHelpLabel,
  sliderValue,
  setSliderValue,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  return (
    <>
      {label}

      {hoverHelpLabel && <HoverHelp label={hoverHelpLabel} />}
      <Slider
        id='slider'
        defaultValue={sliderValue}
        min={sliderProps.min}
        max={sliderProps.max}
        colorScheme='teal'
        onChange={setSliderValue}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg='teal.500'
          color='white'
          placement='top'
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
