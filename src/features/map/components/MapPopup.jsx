import { Button, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Popup } from 'react-map-gl/maplibre'
import { useNavigate } from 'react-router-dom'

export default function MapPopup({
  lat,
  lon,
  display_name,
  onStartSimulation,
}) {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const action = () => {
    if (onStartSimulation) {
      onStartSimulation({ lat, lon, display_name })
      return
    }

    navigate(`/simulation/${lon}/${lat}`)
  }

  const [visible, setVisible] = useState(true)

  return (
    <>
      {visible && (
        <Popup
          latitude={lat}
          longitude={lon}
          // closeButton={false}
          closeOnClick={false}
          onClose={() => setVisible(false)}
        >
          <Text color={'black'} margin='10px'>
            {display_name}
          </Text>
          <Button margin='10px' variant='subtle' onClick={action}>
            {t('startSimulation')}
          </Button>
        </Popup>
      )}
    </>
  )
}
