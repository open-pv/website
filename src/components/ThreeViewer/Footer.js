import React from "react"
import { attributions, licenseLinks } from "../../data/dataLicense"

function Footer({ federalState }) {
  console.log("federalState", federalState)
  const attr = federalState ? attributions[federalState] : undefined

  return (
    <div className="attribution">
      <p key="map-attribution" className="copyright">
        Basiskarte &copy;{" "}
        <a href="https://www.bkg.bund.de" target="_blank">
          BKG
        </a>
        &nbsp;(
        <a href="https://www.govdata.de/dl-de/by-2-0" target="_blank">
          dl-de/by-2-0
        </a>
        )
      </p>
      {federalState && (
        <>
          <p
            key={federalState}
            className="copyright"
            style={federalState ? {} : { display: "none" }}
          >
            Geb&auml;udedaten &copy;{" "}
            <a href={attr.link} target="_blank">
              {attr.attribution}
            </a>
            &nbsp;(
            <a href={licenseLinks[attr.license]} target="_blank">
              {attr.license}
            </a>
            )
          </p>
        </>
      )}
      <p className="copyright">
        &copy; Erstellt vom <a href="https://github.com/open-pv">Team OpenPV</a>
        , <a href="/Impressum">Impressum</a>
        {" | "}
        <a href="/Datenschutz">Datenschutz</a>
        {" | "}
        <a href="" onClick={() => changeLanguage("en")}>
          English
        </a>
        {" | "}
        <a href="" onClick={() => changeLanguage("de")}>
          German
        </a>
      </p>
    </div>
  )
}

export default Footer
