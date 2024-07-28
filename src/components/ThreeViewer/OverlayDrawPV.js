import React from "react"

export default function OverlayDrawPV({
  visiblePVSystems,
  setvisiblePVSystems,
}) {
  const handleCreatePVButtonClick = () => {
    const nextIndex = visiblePVSystems.length
    setvisiblePVSystems([...visiblePVSystems, nextIndex])
  }

  const handleAbortButtonClick = () => {
    window.setFrontendState("Results")
  }

  return (
    <div className="overlay">
      <div className="overlay-buttons">
        <button onClick={handleCreatePVButtonClick}>PV-Anlage erstellen</button>
        <button onClick={handleAbortButtonClick}>Abbrechen</button>
      </div>
    </div>
  )
}
