import React from "react"

export default function Overlay() {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          position: "absolute",
          top: 0,
          margin: "10px",
        }}
      >
        <button style={{ width: "100%", height: "50px" }}>
          PV Anlage einzeichnen
        </button>
        <button style={{ width: "100%", height: "50px" }}>
          Parameter ändern
        </button>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, margin: "10px" }}>
        <div id="footer">
          <p className="copyright">
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
        </div>
      </div>
    </>
  )
}
