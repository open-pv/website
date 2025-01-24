import { Button, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Popup } from 'react-map-gl/maplibre'
import { useNavigate } from 'react-router-dom'

export default function MapPopup({ lat, lon, display_name }) {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const action = () => {
    navigate(`/simulation/${lon}/${lat}`)
  }

  const [visible, setVisible] = useState(true)
  useEffect(() => {
    console.log('effect changed')
    setVisible(true)
  }, [lat, lon])

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
          <Text margin='10px'>{display_name}</Text>
          <Button variant='subtle' onClick={action}>
            {t('startSimulation')}
          </Button>
        </Popup>
      )}
    </>
  )
}
