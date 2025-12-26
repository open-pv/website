import { Provider } from '@/components/ui/provider'
import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/lib/i18n' // needs to be bundled
import '@/assets/styles/main.css' // All of our styles
import { isTouchDevice } from '@/utils/device'
import AppRouter from './router'

const { PUBLIC_URL } = process.env

window.isTouchDevice = isTouchDevice()

// See https://reactjs.org/docs/strict-mode.html
const StrictApp = () => (
  <Provider>
    <BrowserRouter basename={PUBLIC_URL}>
      <AppRouter />
    </BrowserRouter>
  </Provider>
)

const rootElement = document.getElementById('root')

// hydrate is required by react-snap.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <StrictApp />)
} else {
  const root = createRoot(rootElement)
  root.render(<StrictApp />)
}
