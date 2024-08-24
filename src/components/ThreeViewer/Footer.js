import i18n from "i18next"
import React from "react"
import { useTranslation } from "react-i18next"
import { attributions, licenseLinks } from "../../data/dataLicense"

function Footer({ federalState, frontendState }) {
  const attr = federalState ? attributions[federalState] : undefined
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
  const { t } = useTranslation()

  return (
    <div className="overlay">
      <div className="attribution">
        {(frontendState == "Map" ||
          frontendState == "Results" ||
          frontendState == "DrawPV") && (
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
        )}
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
          &copy;
          <a href="https://github.com/open-pv" target="_blank">
            Team OpenPV
          </a>
          , {" | "}
          <a href="https://html5up.net" target="_blank">
            Website Template
          </a>
          {" | "}
          <a href="/Impressum">Impressum</a>
          {" | "}
          <a href="/Datenschutz">{t("Footer.privacyPolicy")}</a>
          {" | "}
          <a
            href=""
            onClick={(e) => {
              e.preventDefault()
              changeLanguage("en")
            }}
          >
            English
          </a>
          {" | "}
          <a
            href=""
            onClick={(e) => {
              e.preventDefault()
              changeLanguage("de")
            }}
          >
            German
          </a>
        </p>
      </div>
    </div>
  )
}

export default Footer
