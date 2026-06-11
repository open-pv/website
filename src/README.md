# Source Directory Structure

This directory contains the OpenPV application source code, organized by function and feature.

## Directory Overview

### 📱 **app/**

Application core - entry point, routing, and root component.

- `index.jsx` - Application entry point
- `App.jsx` - Root component with layout and meta tags
- `router.jsx` - Route configuration

### 📄 **pages/**

Route-level page components. Each page has its own folder.

- `Map/` - Main map view (root `/`)
- `Simulation/` - Simulation results page
- `About/`, `Impressum/`, `Datenschutz/` - Information pages
- `NotFound/` - 404 page

### 🎯 **features/**

Domain-specific features with their own components, logic, and utilities.

- **three-viewer/** - 3D visualization

  - `components/` - Scene, Overlay, Terrain, etc.
  - `meshes/` - Building, vegetation, PV system meshes
  - `controls/` - Map controls, drawing tools
  - `dialogs/` - Options, notifications, legends
  - `context/` - Scene state management (`SceneContextValue` typedef in `SceneContext.jsx`)
  - `utils/` - Color mapping utilities

- **map/** - Map functionality

  - `components/` - Map popup, search field

- **simulation/** - PV simulation engine
  - `core/` - Calculation logic (main, preprocessing, elevation, etc.)
  - `components/` - Savings calculation UI

### 🧩 **components/**

Shared, reusable components used across the app.

- `layout/` - Navigation, Footer, AppLayout, LoadingBar
- `ui/` - Chakra UI component wrappers
- `errors/` - Error display components

### 📐 **types/**

Domain type definitions (JSDoc `@typedef`s). Enable editor and `tsc` validation
without converting the project to TypeScript.

- `building.js` — `Building`, `BuildingType`
- `simulation.js` — `SimulationResult`, `SimulationMesh` (with vertex-attribute contract)
- `vegetation.js` — `VegetationGeometries`
- `pvSystem.js` — `PVSystem`, `PVPoint`
- `frontendState.js` — `FrontendState` runtime const + typedef
- `scene.js` — `SimulationOutput` (return type of `mainSimulation`)
- `index.js` — barrel re-exporting runtime values

**Rules:**

- `SimulationResult` is scene-level — one instance per run, never attached to a `Building`.
- `mainSimulation()` returns a `SimulationOutput`; it does **not** push state via `window.*`.
- `window.isTouchDevice` is the only intentional global; all other `window.*` assignments are forbidden.

### ⚙️ **lib/**

Third-party library configurations.

- `i18n.js` - Internationalization setup

### 🛠️ **utils/**

Shared utility functions.

- `device.js` - Device detection utilities

### 📊 **constants/**

Application-wide constants.

- `colors.js` - Color definitions
- `licenses.js` - Data attribution and licenses

### 🎨 **assets/**

Static assets.

- `styles/` - Global CSS

## Import Patterns

All imports use the `@/` alias for clean, absolute imports:

```javascript
// Good
import { Scene } from '@/features/three-viewer/components/Scene'
import { Navigation } from '@/components/layout/Navigation'
import { colors } from '@/constants/colors'

// Avoid relative imports for cross-directory references
import Scene from '../../../features/three-viewer/components/Scene'
```

## Feature Modules

Features are self-contained with their own:

- Components
- Business logic
- Context/state
- Utilities

Each feature exports a public API via `index.js` for use by other parts of the app.
