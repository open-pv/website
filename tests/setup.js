import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.isTouchDevice (used throughout the app)
beforeAll(() => {
  Object.defineProperty(window, 'isTouchDevice', {
    writable: true,
    value: false
  })
})

// Mock MapLibre GL - it's canvas-based and won't render in jsdom
vi.mock('maplibre-gl', () => ({
  Map: vi.fn(function() {
    return {
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
      fitBounds: vi.fn(),
      flyTo: vi.fn(),
      getCanvas: vi.fn(() => document.createElement('canvas')),
      getMap: vi.fn(() => ({
        dragRotate: { disable: vi.fn() },
        touchZoomRotate: { disableRotation: vi.fn() }
      }))
    }
  }),
  NavigationControl: vi.fn()
}))

// Mock react-map-gl/maplibre wrapper
// Note: Using createElement to avoid JSX in .js file
vi.mock('react-map-gl/maplibre', () => {
  const React = require('react')
  return {
    Map: ({ children, onClick, onMove, ...props }) => {
      return React.createElement(
        'div',
        {
          'data-testid': 'maplibre-map',
          onClick: (e) => onClick?.({ lngLat: { lng: 11.399, lat: 49.457 } }),
          ...props
        },
        children
      )
    },
    NavigationControl: () => React.createElement('div', { 'data-testid': 'navigation-control' })
  }
})

// Mock WebGL context for Three.js
const mockWebGLContext = {
  canvas: document.createElement('canvas'),
  getExtension: vi.fn(),
  getParameter: vi.fn(),
  getShaderPrecisionFormat: vi.fn(() => ({
    precision: 1,
    rangeMin: 1,
    rangeMax: 1
  })),
  createProgram: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getShaderParameter: vi.fn(() => true),
  deleteShader: vi.fn(),
  deleteProgram: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
}

HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext
  }
  if (contextType === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    }
  }
  return null
})

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock URL.createObjectURL and revokeObjectURL for file handling
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock IntersectionObserver (used by some UI libraries)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {
    this.observe = vi.fn()
    this.unobserve = vi.fn()
    this.disconnect = vi.fn()
  }
}

// Mock ResizeObserver (used by Chakra UI and other libraries)
global.ResizeObserver = class ResizeObserver {
  constructor() {
    this.observe = vi.fn()
    this.unobserve = vi.fn()
    this.disconnect = vi.fn()
  }
}

// Mock WelcomeMessage component to not block UI during tests
vi.mock('../src/components/Template/WelcomeMessage', () => ({
  default: () => null
}))

// Mock DRACOLoader to prevent WASM loading errors in tests
// Mock both paths since Three.js v0.172 uses 'three/addons'
vi.mock('three/addons/loaders/DRACOLoader.js', () => ({
  DRACOLoader: class DRACOLoader {
    setDecoderPath() {}
    setDecoderConfig() {}
    preload() {}
    dispose() {}
    load(url, onLoad, onProgress, onError) {
      // Simulate successful load with empty geometry
      if (onLoad) {
        setTimeout(() => onLoad({ geometry: null }), 0)
      }
    }
  }
}))

vi.mock('three/examples/jsm/loaders/DRACOLoader', () => ({
  DRACOLoader: class DRACOLoader {
    setDecoderPath() {}
    setDecoderConfig() {}
    preload() {}
    dispose() {}
    load(url, onLoad, onProgress, onError) {
      // Simulate successful load with empty geometry
      if (onLoad) {
        setTimeout(() => onLoad({ geometry: null }), 0)
      }
    }
  }
}))

// Mock GLTFLoader which uses DRACOLoader
// Mock both paths since Three.js v0.172 uses 'three/addons'
vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class GLTFLoader {
    setDRACOLoader() {}
    parse(data, path, onLoad, onError) {
      const mockGLTF = {
        scene: {},
        scenes: [],
        animations: [],
        parser: {
          getDependency: () => Promise.resolve(new ArrayBuffer(0))
        }
      }
      if (onLoad) {
        setTimeout(() => onLoad(mockGLTF), 0)
      }
      return mockGLTF
    }
    load(url, onLoad, onProgress, onError) {
      // Simulate successful load with empty GLTF
      if (onLoad) {
        const mockGLTF = {
          scene: {},
          scenes: [],
          animations: [],
          parser: {
            getDependency: () => Promise.resolve(new ArrayBuffer(0))
          }
        }
        setTimeout(() => onLoad(mockGLTF), 0)
      }
    }
    loadAsync(url) {
      // Return a promise that resolves with empty GLTF
      return Promise.resolve({
        scene: {},
        scenes: [],
        animations: [],
        userData: {},
        parser: {
          getDependency: () => Promise.resolve(new ArrayBuffer(0))
        }
      })
    }
  }
}))

vi.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: class GLTFLoader {
    setDRACOLoader() {}
    parse(data, path, onLoad, onError) {
      const mockGLTF = {
        scene: {},
        scenes: [],
        animations: [],
        parser: {
          getDependency: () => Promise.resolve(new ArrayBuffer(0))
        }
      }
      if (onLoad) {
        setTimeout(() => onLoad(mockGLTF), 0)
      }
      return mockGLTF
    }
    load(url, onLoad, onProgress, onError) {
      // Simulate successful load with empty GLTF
      if (onLoad) {
        const mockGLTF = {
          scene: {},
          scenes: [],
          animations: [],
          parser: {
            getDependency: () => Promise.resolve(new ArrayBuffer(0))
          }
        }
        setTimeout(() => onLoad(mockGLTF), 0)
      }
    }
    loadAsync(url) {
      // Return a promise that resolves with empty GLTF
      return Promise.resolve({
        scene: {},
        scenes: [],
        animations: [],
        userData: {},
        parser: {
          getDependency: () => Promise.resolve(new ArrayBuffer(0))
        }
      })
    }
  }
}))
