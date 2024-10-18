import React, { useRef, useState } from "react"
import { Canvas } from "react-three-fiber"

import CustomMapControl from "./Controls/CustomMapControl"
import DrawPVControl from "./Controls/DrawPVControl"
import { HighlightedPVSystem } from "./Meshes/HighlitedPVSystem"
import { HighlightedMesh } from "./Meshes/HiglightedMesh"
import { PVSystems } from "./Meshes/PVSystems"
import SimulationMesh from "./Meshes/SimulationMesh"
import SurroundingMesh from "./Meshes/SurroundingMesh"
import VegetationMesh from "./Meshes/VegetationMesh"
import Overlay from "./Overlay"
import PointsAndEdges from "./PointsAndEdges"
import Terrain from "./Terrain"

const Scene = ({
  frontendState,
  setFrontendState,
  geometries,
  simulationMeshes,
  setSimulationMeshes,
  selectedMesh,
  setSelectedMesh,
  selectedPVSystem,
  setSelectedPVSystem,
  vegetationGeometries,
  geoLocation,
}) => {
  // showTerrain decides if the underlying Map is visible or not
  const [showTerrain, setShowTerrain] = useState(true)
  // A list of visible PV Systems - they get visible after they are drawn on a building and calculated
  const [pvSystems, setPVSystems] = useState([])
  // pvPoints are the red points that appear when drawing PV systems
  const [pvPoints, setPVPoints] = useState([])

  window.setPVPoints = setPVPoints
  const position = [
    simulationMeshes[0].middle.x,
    simulationMeshes[0].middle.y - 40,
    simulationMeshes[0].middle.z + 80,
  ]
  const cameraRef = useRef()
  return (
    <>
      <Overlay
        frontendState={frontendState}
        setFrontendState={setFrontendState}
        showTerrain={showTerrain}
        setShowTerrain={setShowTerrain}
        selectedMesh={selectedMesh}
        setSelectedMesh={setSelectedMesh}
        geometries={geometries}
        geoLocation={geoLocation}
        setPVSystems={setPVSystems}
        pvSystems={pvSystems}
        selectedPVSystem={selectedPVSystem}
        setSelectedPVSystem={setSelectedPVSystem}
        pvPoints={pvPoints}
        setPVPoints={setPVPoints}
        simulationMeshes={simulationMeshes}
        setSimulationMeshes={setSimulationMeshes}
      />

      <Canvas
        camera={{
          fov: 45,
          near: 1,
          far: 20000,
          position: position,
          up: [0, 0, 1],
          ref: cameraRef,
        }}
      >
        <ambientLight intensity={2} />
        <directionalLight intensity={1} position={[0, -1, -2]} />
        <directionalLight intensity={0.5} position={[1, 0, -2]} />
        <directionalLight intensity={0.5} position={[-1, 0, -2]} />

        {geometries.surrounding.length > 0 && (
          <SurroundingMesh geometries={geometries.surrounding} />
        )}
        {geometries.background.length > 0 && (
          <SurroundingMesh geometries={geometries.background} />
        )}

        {simulationMeshes.length > 0 && (
          <SimulationMesh meshes={simulationMeshes} />
        )}
        {selectedMesh && <HighlightedMesh meshes={selectedMesh} />}
        {selectedPVSystem && (
          <HighlightedPVSystem geometries={selectedPVSystem} />
        )}
        {simulationMeshes.length > 0 && frontendState == "Results" && (
          <CustomMapControl
            middle={simulationMeshes[0].middle}
            setSelectedMesh={setSelectedMesh}
            setSelectedPVSystem={setSelectedPVSystem}
          />
        )}
        {frontendState == "DrawPV" && (
          <DrawPVControl
            middle={simulationMeshes[0].middle}
            setPVPoints={setPVPoints}
          />
        )}
        {frontendState == "DrawPV" && <PointsAndEdges points={pvPoints} />}

        {pvSystems.length > 0 && <PVSystems pvSystems={pvSystems} />}

        {vegetationGeometries && (
          <>
            {vegetationGeometries.background &&
              vegetationGeometries.background.length > 0 && (
                <VegetationMesh geometries={vegetationGeometries.background} />
              )}
            {vegetationGeometries.surrounding &&
              vegetationGeometries.surrounding.length > 0 && (
                <VegetationMesh geometries={vegetationGeometries.surrounding} />
              )}
          </>
        )}

        {simulationMeshes.length > 0 && <Terrain visible={showTerrain} />}
      </Canvas>
    </>
  )
}

export default Scene
