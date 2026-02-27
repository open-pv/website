import React, { useCallback, useRef, useState } from 'react'
import App from '@/app/App'

import { toaster } from '@/components/ui/toaster'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTranslation } from 'react-i18next'
import { Map, NavigationControl } from 'react-map-gl/maplibre'
import { useSearchParams } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import MapPopup from '@/features/map/components/MapPopup'
import SearchField from '@/features/map/components/SearchField'
import WelcomeMessage from '@/components/layout/WelcomeMessage'
import { BUNDESLAENDER } from '@/data/bundeslaender'
import { STAEDTE } from '@/data/staedte'

function Index() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const bundeslandKey = searchParams.get('bundesland')
  const stadtKey = searchParams.get('stadt')

  const matchedBundesland =
    bundeslandKey &&
    Object.keys(BUNDESLAENDER).find(
      (k) => k.toLowerCase() === bundeslandKey.toLowerCase(),
    )
  const matchedStadt =
    stadtKey &&
    Object.keys(STAEDTE).find(
      (k) => k.toLowerCase() === stadtKey.toLowerCase(),
    )

  // stadt takes precedence over bundesland if both are set
  const location = matchedStadt
    ? STAEDTE[matchedStadt]
    : matchedBundesland
      ? BUNDESLAENDER[matchedBundesland]
      : null

  const basemap_source = {
    id: 'basemap-source',
    type: 'raster',
    tiles: [
      'https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_farbe/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png',
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
    id: 'basemap',
    type: 'raster',
    source: 'basemap-source',
    // minzoom: 0,
    // maxzoom: 22,
  }

  const defaultBounds = [5.98, 47.3, 15.1, 55.0]

  const [viewState, setViewState] = useState({
    bounds: location ? location.bounds : defaultBounds,
    zoom: 6,
  })

  const pageTitle = location ? `Solaranlage ${location.name}` : null
  const pageDescription = location
    ? `Berechne kostenlos das Solarpotenzial deines Hauses in ${location.name}. OpenPV zeigt dir, wie viel Solarenergie dein Dach erzeugen kann.`
    : null

  const [mapMarkers, setMapMarkers] = useState([])

  const searchCallback = (locations) => {
    if (locations.length == 0) {
      console.error('No search results!')
      toaster.create({
        title: t('noSearchResults.title'),
        description: t('noSearchResults.description'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } else {
      // Use only the first one
      const location = locations[0]
      let bounds = location.boundingBox

      if (location.addressType === 'building') {
        // Only add popup when search result is a building!
        setMapMarkers([<MapPopup key={location.key} {...location} />])
      }
      console.log('bounds')
      console.log(bounds)
      mapRef.current.fitBounds(bounds, {
        maxZoom: 17,
        speed: 2,
      })
    }
  }

  const mapRef = useRef()
  const setMapRef = useCallback((current) => {
    mapRef.current = current
    if (current !== null) {
      current.getMap().dragRotate.disable()
      current.getMap().touchZoomRotate.disableRotation()
      if (location) {
        current.fitBounds(location.bounds)
      }
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
    <App title={pageTitle} description={pageDescription}>
      <h1
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      >
        {location ? `Solaranlage ${location.name}` : t('title')}
      </h1>
      <header>
        <div className='title'>
          <SearchField callback={searchCallback} />
        </div>
      </header>
      <WelcomeMessage />
      <div className='content'>
        <Map
          ref={setMapRef}
          {...viewState}
          maxZoom={19}
          style={{ width: '100%', height: '100%' }}
          mapStyle='https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json'
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={mapClick}
          attributionControl={false}
          maxBounds={[-10, 35, 30, 65]}
        >
          <>{mapMarkers}</>
          {clickPoint && (
            <MapPopup
              key='userSelectiion'
              lat={clickPoint[0]}
              lon={clickPoint[1]}
              display_name={t('map.userSelection')}
            />
          )}
          <NavigationControl position='bottom-right' showCompass={false} />
        </Map>
        <Footer federalState='' frontendState='Map' />
      </div>
    </App>
  )
}

export default Index
