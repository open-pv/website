import App from '@/app/App'
import { Heading, Image, Link, Text } from '@chakra-ui/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { toaster } from '@/components/ui/toaster'
import { BUNDESLAENDER } from '@/data/bundeslaender'
import { STAEDTE } from '@/data/staedte'
import { createSimulation3DLayerController } from '@/features/map/core/simulation3dLayer'
import MapPopup from '@/features/map/components/MapPopup'
import SearchField from '@/features/map/components/SearchField'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTranslation } from 'react-i18next'
import { Map as MapLibreMap, NavigationControl } from 'react-map-gl/maplibre'
import { useSearchParams } from 'react-router-dom'

function Index() {
  const { t, i18n } = useTranslation()
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
    Object.keys(STAEDTE).find((k) => k.toLowerCase() === stadtKey.toLowerCase())

  // stadt takes precedence over bundesland if both are set
  const location = matchedStadt
    ? STAEDTE[matchedStadt]
    : matchedBundesland
      ? BUNDESLAENDER[matchedBundesland]
      : null

  const defaultBounds = [5.98, 47.3, 15.1, 55.0]

  const [viewState, setViewState] = useState({
    bounds: location ? location.bounds : defaultBounds,
    bearing: 0,
    pitch: 0,
    zoom: 6,
  })

  const pageTitle = location ? `Solaranlage ${location.name}` : null
  const pageDescription = location
    ? `Berechne kostenlos das Solarpotenzial deines Hauses in ${location.name}. OpenPV zeigt dir, wie viel Solarenergie dein Dach erzeugen kann.`
    : null

  const [mapMarkers, setMapMarkers] = useState([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [previewRegion, setPreviewRegion] = useState(null)
  const [simulationLocation, setSimulationLocation] = useState(null)
  const simulationLayerRef = useRef(null)
  const PREVIEW_MIN_ZOOM = 15

  const focusMapOnLocation = useCallback((lat, lon, use3DView = false) => {
    const map = mapRef.current?.getMap()
    const currentPitch = map?.getPitch() ?? 0
    const currentBearing = map?.getBearing() ?? 0
    const targetPitch = use3DView ? (currentPitch > 0 ? currentPitch : 60) : 0
    const targetBearing = use3DView
      ? currentPitch > 0 || currentBearing !== 0
        ? currentBearing
        : -20
      : 0

    map?.easeTo({
      center: [Number(lon), Number(lat)],
      zoom: 18,
      pitch: targetPitch,
      bearing: targetBearing,
      duration: 1200,
    })
  }, [])

  const startSimulationInMap = useCallback(
    ({ lat, lon }) => {
      setSimulationLocation({ lat, lon })
      focusMapOnLocation(lat, lon, true)
    },
    [focusMapOnLocation],
  )

  const updatePreviewRegion = useCallback(() => {
    if (!mapRef.current || simulationLocation) {
      return
    }

    const map = mapRef.current.getMap()
    const zoom = map.getZoom()
    if (zoom < PREVIEW_MIN_ZOOM) {
      setPreviewRegion(null)
      return
    }

    const bounds = map.getBounds()
    const center = map.getCenter()
    setPreviewRegion({
      bounds: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      center: {
        lat: center.lat,
        lon: center.lng,
      },
    })
  }, [simulationLocation])

  const searchCallback = (locations) => {
    if (locations.length === 0) {
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
        setSimulationLocation(null)
        setClickPoint(null)
        setMapMarkers([
          <MapPopup
            key={location.key}
            {...location}
            onStartSimulation={startSimulationInMap}
          />,
        ])

        focusMapOnLocation(location.lat, location.lon, viewState.pitch > 0)
        return
      } else {
        setMapMarkers([])
        setSimulationLocation(null)
      }

      mapRef.current.fitBounds(bounds, {
        maxZoom: 17,
        speed: 2,
      })
    }
  }

  const mapRef = useRef()
  const setMapRef = useCallback(
    (current) => {
      mapRef.current = current
      if (current !== null) {
        if (location) {
          current.fitBounds(location.bounds)
        }
      }
    },
    [location],
  )

  // Handling map click for manual location selection
  const [clickPoint, setClickPoint] = useState(null)
  const mapClick = useCallback(
    (evt) => {
      const pickedBuilding = simulationLayerRef.current?.pickBuildingAtPoint(
        evt.point,
      )
      const { lng, lat } = pickedBuilding || evt.lngLat
      setClickPoint([lat, lng])
      setMapMarkers([])
      setSimulationLocation(null)
      focusMapOnLocation(lat, lng, viewState.pitch > 0)
    },
    [focusMapOnLocation, viewState.pitch],
  )

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || simulationLayerRef.current) {
      return
    }

    const map = mapRef.current.getMap()
    simulationLayerRef.current = createSimulation3DLayerController({
      map,
      onError: (error) => {
        console.error('Error loading map simulation layer', error)
      },
    })

    return () => {
      simulationLayerRef.current?.remove()
      simulationLayerRef.current = null
    }
  }, [mapLoaded])

  useEffect(() => {
    if (!mapLoaded || !simulationLayerRef.current) {
      return
    }

    if (simulationLocation) {
      simulationLayerRef.current.setLocation(simulationLocation)
      return
    }

    if (previewRegion) {
      simulationLayerRef.current.preloadBounds(previewRegion)
      return
    }

    simulationLayerRef.current.clear()
  }, [mapLoaded, previewRegion, simulationLocation])

  return (
    <App title={pageTitle} description={pageDescription}>
      <div className='map-landing-container'>
        <div className='map-full-section'>
          <div className='map-search-overlay'>
            <SearchField callback={searchCallback} />
          </div>
          <MapLibreMap
            ref={setMapRef}
            {...viewState}
            maxZoom={19}
            maxPitch={85}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#d3d3d3',
            }}
            canvasContextAttributes={{ antialias: true }}
            mapStyle='./basemap_de_nobuildings.json'
            onMove={(evt) => setViewState(evt.viewState)}
            onMoveEnd={updatePreviewRegion}
            onClick={mapClick}
            onLoad={() => {
              setMapLoaded(true)
              updatePreviewRegion()
            }}
            attributionControl={false}
            maxBounds={[-10, 35, 30, 65]}
          >
            <>{mapMarkers}</>
            {clickPoint && (
              <MapPopup
                key={`${clickPoint[0]}:${clickPoint[1]}`}
                lat={clickPoint[0]}
                lon={clickPoint[1]}
                display_name={t('map.userSelection')}
                onStartSimulation={startSimulationInMap}
              />
            )}
            <NavigationControl position='bottom-right' showCompass />
          </MapLibreMap>
          <div className='map-attribution'>
            <p className='copyright'>
              Basiskarte &copy;{' '}
              <a
                href='https://www.bkg.bund.de'
                target='_blank'
                rel='noopener noreferrer'
              >
                BKG
              </a>
              &nbsp;(
              <a
                href='https://www.govdata.de/dl-de/by-2-0'
                target='_blank'
                rel='noopener noreferrer'
              >
                dl-de/by-2-0
              </a>
              ) | Geländemodell:&nbsp;
              <a
                href='https://sonny.4lima.de'
                target='_blank'
                rel='noopener noreferrer'
              >
                &copy;&nbsp;Sonny
              </a>
              &nbsp;(
              <a
                href='https://creativecommons.org/licenses/by/4.0/deed.en'
                target='_blank'
                rel='noopener noreferrer'
              >
                CC-BY-4.0
              </a>
              ), erstellt aus{' '}
              <a
                href='https://drive.google.com/file/d/1rgGA22Ha42ulQORK9Pfp4JPpPAIKFx6Q/view'
                target='_blank'
                rel='noopener noreferrer'
              >
                verschiedenen Quellen
              </a>
            </p>
          </div>
        </div>

        <div className='landing-info'>
          <Heading as='h1' size='2xl' mb='4'>
            {t(`WelcomeMessage.title`) +
              (location ? ` in ${location.name}` : '')}
          </Heading>
          <Text mb='6'>{t('WelcomeMessage.introduction')}</Text>
          {[0, 1, 2, 3, 4].map((i) => (
            <section key={i} className='landing-step'>
              <Heading as='h2' size='lg' mb='2'>
                {t(`WelcomeMessage.${i}.title`)}
              </Heading>
              {t(`WelcomeMessage.${i}.alt`) && (
                <Image
                  src={`/images/WelcomeMessage${i}.png`}
                  alt={t(`WelcomeMessage.${i}.alt`)}
                  maxH='250px'
                  borderRadius='md'
                  my='2'
                />
              )}
              <Text>{t(`WelcomeMessage.${i}.text`)}</Text>
            </section>
          ))}
          <footer className='landing-footer'>
            <Text>
              &copy;&nbsp;
              <Link
                href='https://github.com/open-pv'
                target='_blank'
                rel='noopener noreferrer'
              >
                Team OpenPV
              </Link>
              {' | '}
              <Link href='/Impressum'>Impressum</Link>
              {' | '}
              <Link href='/Datenschutz'>{t('Footer.privacyPolicy')}</Link>
              {' | '}
              <Link
                href=''
                onClick={(e) => {
                  e.preventDefault()
                  i18n.changeLanguage('en')
                }}
              >
                English
              </Link>
              {' | '}
              <Link
                href=''
                onClick={(e) => {
                  e.preventDefault()
                  i18n.changeLanguage('de')
                }}
              >
                German
              </Link>
            </Text>
          </footer>
        </div>
      </div>
    </App>
  )
}

export default Index
