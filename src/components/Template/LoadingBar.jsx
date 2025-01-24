import { ProgressBar, ProgressRoot } from '@/components/ui/progress'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LoadingBar = ({ progress }) => {
  const { t } = useTranslation()
  const numberTips = 3
  const [shownTip, setShownTip] = useState(0)

  useEffect(() => {
    // Set a random tip when the component mounts
    const randomTip = Math.floor(Math.random() * numberTips) + 1
    setShownTip(randomTip)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <p style={{ margin: '20px' }}>
        {t('loadingMessage.tip' + shownTip.toString())}
      </p>
      <div style={{ width: '80%', maxWidth: '600px', margin: '0 auto' }}>
        <ProgressRoot value={progress} max={100} min={0} striped>
          <ProgressBar />
        </ProgressRoot>
      </div>
    </div>
  )
}

export default LoadingBar
