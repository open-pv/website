import { Button } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Popup } from "react-map-gl/maplibre"
import { useNavigate } from "react-router-dom"

export default function MapPopup({lat, lon, display_name}) {
  const { t, i18n } = useTranslation()

  const navigate = useNavigate();
  const action = () => {
    navigate(`/simulation/${lon}/${lat}`)
  };

  return (
  <Popup
    latitude={lat}
    longitude={lon}
    closeButton={false}
    closeOnClick={false}
  >
      { display_name }
      <Button onClick={action}>
        { t('startSimulation') }
      </Button>
  </Popup>
  )
}
