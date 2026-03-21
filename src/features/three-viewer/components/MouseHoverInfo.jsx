import { SceneContext } from '@/features/three-viewer/context/SceneContext'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

const CARDINAL_DIRECTIONS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
]

function azimuthToCardinal(azimuth) {
  const index = Math.round(azimuth / 22.5) % 16
  return CARDINAL_DIRECTIONS[index]
}

/**
 * Displays mouse hover information for slope, azimuth, and yield.
 * Only shown on non-touch devices.
 */
export const MouseHoverInfo = () => {
  const { t } = useTranslation()
  const { slope, azimuth, yieldPerKWP } = useContext(SceneContext)

  const cardinalDirection =
    azimuth !== null && azimuth !== undefined
      ? t(`cardinal.${azimuthToCardinal(azimuth)}`)
      : null

  return (
    <div className='mouse-hover-info'>
      {t('slope')}: {slope}° &nbsp;|&nbsp; {t('azimuth')}: {cardinalDirection}
      <br /> {t('yieldPerYear')}:
      {yieldPerKWP ? ` ${Math.round(yieldPerKWP / 100) * 100} kWh/kWp` : ''}
    </div>
  )
}
