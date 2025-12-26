import React, { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import App from './App'

// Every route - we lazy load so that each page can be chunked
// NOTE that some of these chunks are very small. We should optimize
// which pages are lazy loaded in the future.
const Map = lazy(() => import('@/pages/Map'))
const Simulation = lazy(() => import('@/pages/Simulation'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Impressum = lazy(() => import('@/pages/Impressum'))
const Datenschutz = lazy(() => import('@/pages/Datenschutz'))
const About = lazy(() => import('@/pages/About'))

const AppRouter = () => {
  return (
    <Suspense fallback={<App />}>
      <Routes>
        <Route path='/' element={<Map />} />
        <Route path='/simulation/:lon/:lat' element={<Simulation />} />
        <Route path='/anleitung' element={<About />} />
        <Route path='/about' element={<About />} />
        <Route path='/impressum' element={<Impressum />} />
        <Route path='/datenschutz' element={<Datenschutz />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
