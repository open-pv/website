import React, { useState } from "react"
import WrongAdress from "../components/ErrorMessages/WrongAdress"
import SearchField from "../components/PVSimulation/SearchField"
import ThreeViewer from "../components/ThreeViewer/ThreeViewer"
import Main from "../layouts/Main"

function Index() {
  const [showMap, setShowMap] = useState(true)
  const [showSimulatedBuilding, setshowSimulatedBuilding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorNoGeometry, setshowErrorNoGeometry] = useState(false)

  window.setShowThreeViewer = setShowMap
  window.setshowErrorNoGeometry = setshowErrorNoGeometry
  window.setIsLoading = setIsLoading
  window.setshowSimulatedBuilding = setshowSimulatedBuilding

  return (
    <Main description={"Berechne das Potential deiner Solaranlage."}>
      <article className="post" id="index">
        <header>
          <div className="title">
            <SearchField
              setIsLoading={setIsLoading}
              setshowSimulatedBuilding={setshowSimulatedBuilding}
            />
          </div>
        </header>
        {showErrorNoGeometry && <WrongAdress />}

        {showMap && (
          <ThreeViewer showSimulatedBuilding={showSimulatedBuilding} />
        )}
        {isLoading && <p>Show Loading Bar Component Now</p>}
      </article>
    </Main>
  )
}

export default Index
