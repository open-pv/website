import React, { useState } from "react"
import SearchField from "../components/PVSimulation/SearchField"

import ThreeViewer from "../components/ThreeViewer/ThreeViewer"
import Main from "../layouts/Main"

const override = {
  display: "block",
  margin: "auto",
  borderColor: "red",
}

function Index() {
  const [showMap, setShowMap] = useState(true)
  const [showSimulatedBuilding, setshowSimulatedBuilding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [showTooManyUniformsError, setShowTooManyUniformsError] =
    useState(false)

  window.setShowThreeViewer = setShowMap
  window.setShowErrorMessage = setShowErrorMessage
  window.setShowTooManyUniformsError = setShowTooManyUniformsError
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
        {showErrorMessage && <WrongAdress />}
        {showTooManyUniformsError && <TooManyUniforms />}
        {showMap && (
          <ThreeViewer
            showSimulatedBuilding={showSimulatedBuilding}
            isLoading={isLoading}
          />
        )}
        {isLoading && <p>Show Loading Bar Now</p>}
      </article>
    </Main>
  )
}

export default Index
