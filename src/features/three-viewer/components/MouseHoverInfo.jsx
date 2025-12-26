import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SceneContext } from '@/features/three-viewer/context/SceneContext'

/**
 * Displays mouse hover information for slope, azimuth, and yield.
 * Only shown on non-touch devices.
 */
export const MouseHoverInfo = () => {
  const { t } = useTranslation()
  const { slope, azimuth, yieldPerKWP } = useContext(SceneContext)

  return (
    <div className='attribution' id='footer-on-hover'>
      {t('slope')}: {slope}°
      <br />
      {t('azimuth')}: {azimuth}°
      {yieldPerKWP ? (
        <p>
          {t('yieldPerYear')}: {Math.round(yieldPerKWP / 100) * 100} kWh/kWp
        </p>
      ) : null}
    </div>
  )
}
