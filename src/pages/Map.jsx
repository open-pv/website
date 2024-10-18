import React, { useCallback, useRef, useState } from "react"
import Main from "../Main"

import { useToast } from "@chakra-ui/react"
import "maplibre-gl/dist/maplibre-gl.css"
import { useTranslation } from "react-i18next"
import { Layer, Map, NavigationControl, Source } from "react-map-gl/maplibre"
import Footer from "../components/Footer"
import MapPopup from "../components/MapPopup"
import SearchField from "../components/PVSimulation/SearchField"
import WelcomeMessage from "../components/Template/WelcomeMessage"

function Index() {
  const { t } = useTranslation()

  const boundingBox = [5.98, 47.3, 15.1, 55.0]

  const [viewState, setViewState] = useState({
    bounds: boundingBox,
  })

  const [mapMarkers, setMapMarkers] = useState([])

  const toast = useToast()

  const searchCallback = (locations) => {
    if (locations.length == 0) {
      console.error("No search results!")
      toast({
        title: t("noSearchResults.title"),
        description: t("noSearchResults.description"),
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    } else {
      // Use only the first one
      locations = [locations[0]]
      const lons = locations.map((loc) => loc.lon)
      const lats = locations.map((loc) => loc.lat)

      const bounds = [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats),
      ]
      mapRef.current.fitBounds(bounds, {
        maxZoom: 17,
        speed: 2,
      })
    }
    setMapMarkers(
      locations.map((location) => <MapPopup key={location.key} {...location} />)
    )
  }

  const mapRef = useRef()
  const setMapRef = useCallback((current) => {
    mapRef.current = current
    if (current !== null) {
      current.getMap().dragRotate.disable()
      current.getMap().touchZoomRotate.disableRotation()
    }
  }, [])

  // Handling map click for manual location selection
  const [clickPoint, setClickPoint] = useState(null)
  const mapClick = useCallback((evt) => {
    console.log(evt)
    const { lng, lat } = evt.lngLat
    setClickPoint([lat, lng])
  })

  return (
    <Main description={t("mainDescription")}>
      <header>
        <div className="title">
          <SearchField callback={searchCallback} />
        </div>
      </header>
      <WelcomeMessage />
      <div className="content">
        <Map
          ref={setMapRef}
          {...viewState}
          maxZoom={19}
          style={{ width: "100%", height: "100%" }}
          mapStyle="./mapstyle-bright-localname.json"
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={mapClick}
          attributionControl={false}
          maxBounds={[-10, 35, 30, 65]}
        >
          <Source id="nodata" type="geojson" data="./nodata.geojson">
            <Layer id="nodata" type="fill" paint={{
              'fill-color': '#000',
              'fill-opacity': ['interpolate', ['linear'], ['zoom'],
                8, 0.5,
                12, 0
              ]
            }} />
          </Source>
          <>{mapMarkers}</>
          {clickPoint && (
            <MapPopup
              key="userSelectiion"
              lat={clickPoint[0]}
              lon={clickPoint[1]}
              display_name={t("map.userSelection")}
            />
          )}
          <NavigationControl position="bottom-right" showCompass={false} />
        </Map>
        <Footer federalState="" frontendState="Map" />
      </div>
    </Main>
  )
}

export default Index
