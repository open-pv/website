import React from "react"

export default function Overlay({ setIsDrawPV }) {
  return (
    <div class="overlay">
      <div class="overlay-buttons">
        <button onClick={setIsDrawPV(true)}>
          PV Anlage einzeichnen
        </button>
        <button >
          Parameter ändern
        </button>
      </div>

      <div class="attribution">
        <p class="copyright">
          <a href="https://geodaten.bayern.de/opengeodata/">Gebäudedaten</a>{" "}
          der
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
          &copy; Erstellt vom <a href="https://github.com/open-pv">Team OpenPV</a>,{" "}
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
