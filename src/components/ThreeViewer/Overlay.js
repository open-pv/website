import React from "react"

export default function Overlay({
  setControlsState,
  showTerrain,
  setShowTerrain,
}) {
  return (
    <div className="overlay">
      <div className="overlay-buttons">
        <button onClick={() => setControlsState("drawPV")}>
          PV Anlage einzeichnen
        </button>
        <button>Parameter ändern</button>
        <button onClick={() => setShowTerrain(!showTerrain)}>
          Karte ein-/ausblenden
        </button>
      </div>
      <div className="attribution">
        <p className="copyright">
          <a href="https://geodaten.bayern.de/opengeodata/">Gebäudedaten</a> der
          <a href="https://www.ldbv.bayern.de/vermessung/bvv.html">
            {" "}
            Bayerischen Vermessungsverwaltung{" "}
          </a>{" "}
          |
          <a href="https://creativecommons.org/licenses/by/4.0/deed.de">
            CC BY 4.0
          </a>
        </p>

        <p className="copyright">
          &copy; Erstellt vom{" "}
          <a href="https://github.com/open-pv">Team OpenPV</a>,{" "}
          <a href="/Impressum">Impressum</a>
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
    </div>
  )
}
