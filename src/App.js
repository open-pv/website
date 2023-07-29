import React, { Suspense, lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./i18n" // needs to be bundled
import Main from "./layouts/Main" // fallback for lazy pages
import "./static/css/main.scss" // All of our styles

const { PUBLIC_URL } = process.env

// Every route - we lazy load so that each page can be chunked
// NOTE that some of these chunks are very small. We should optimize
// which pages are lazy loaded in the future.
const Index = lazy(() => import("./pages/Index"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Impressum = lazy(() => import("./pages/Impressum"))
const About = lazy(() => import("./pages/About"))

const App = () => (
  <BrowserRouter basename={PUBLIC_URL}>
    <Suspense fallback={<Main />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/anleitung" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default App
