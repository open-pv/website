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

  const basemap_source = {
    id: "basemap-source",
    type: "raster",
    tiles: [
      "https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png",
    ],
    attribution: `
        Basiskarte &copy;
        <a href="https://www.bkg.bund.de" target="_blank">
          BKG
        </a>
        &nbsp;(
        <a href="https://www.govdata.de/dl-de/by-2-0" target="_blank">
          dl-de/by-2-0
        </a>
        )
    `,
  }
  const basemap_layer = {
    id: "basemap",
    type: "raster",
    source: "basemap-source",
    // minzoom: 0,
    // maxzoom: 22,
  }

  const [viewState, setViewState] = useState({
    bounds: [5.98865807458, 47.3024876979, 15.0169958839, 54.983104153],
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
    <Main description={"Berechne das Potential deiner Solaranlage."}>
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
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={mapClick}
          attributionControl={false}
        >
          <Layer
            id="background"
            type="background"
            paint={{
              "background-color": "lightgray",
            }}
          />
          <Source {...basemap_source}>
            <Layer {...basemap_layer} />
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
