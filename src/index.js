import React, { Suspense, lazy } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./i18n" // needs to be bundled
import Main from "./Main" // fallback for lazy pages
import "./static/css/main.scss" // All of our styles

const { PUBLIC_URL } = process.env

// Every route - we lazy load so that each page can be chunked
// NOTE that some of these chunks are very small. We should optimize
// which pages are lazy loaded in the future.
const Index = lazy(() => import("./pages/Index"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Impressum = lazy(() => import("./pages/Impressum"))
const Datenschutz = lazy(() => import("./pages/Datenschutz"))
const About = lazy(() => import("./pages/About"))

// See https://reactjs.org/docs/strict-mode.html
const StrictApp = () => (
  <React.StrictMode>
    <BrowserRouter basename={PUBLIC_URL}>
      <Suspense fallback={<Main />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/anleitung" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
)

const rootElement = document.getElementById("root")

// hydrate is required by react-snap.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <StrictApp />)
} else {
  const root = createRoot(rootElement)
  root.render(<StrictApp />)
}
