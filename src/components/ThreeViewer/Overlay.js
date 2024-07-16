import React from "react"

import { useState } from "react"

export default function Overlay() {
  window.setAttribution = {};
  const attrs = Object.keys(attributions).map(Attribution);
  console.log(window.setAttribution)

  return (
    <>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
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
          { attrs }
        </div>
      </div>
    </>
  )
}

function Attribution(bundesland) {
  const [state, set] = useState(false);
  window.setAttribution[bundesland] = value => {
    console.log(`Setting attribution for ${bundesland} to ${value}`); set(value) };
  const attr = attributions[bundesland];

  return (<>
    <p key="{bundesland}" class="copyright" style={state ? {} : { display: 'none' }} >
    Geb&auml;udedaten &copy; <a href={attr.link} target="_blank">{attr.attribution}</a>
    &nbsp;(<a href={license_links[attr.license]} target="_blank">{attr.license}</a>)
    </p>
  </>)
}

const attributions = {
  BB: {attribution: 'GeoBasis-DE/LGB', license: 'dl-de/by-2-0', link: 'https://geoportal.brandenburg.de/'},
  BY: {attribution: 'Bayerische Vermessungsverwaltung', license: 'cc/by-4-0', link: 'https://geodaten.bayern.de/opengeodata/OpenDataDetail.html?pn=lod2'},
  BW: {attribution: 'Datenquelle: LGL, www.lgl-bw.de', license: 'dl-de/by-2-0', link: 'https://www.lgl-bw.de/Produkte/3D-Produkte/3D-Gebaeudemodelle/'},
  BE: {attribution: 'Geoportal Berlin / 3D-Gebäudemodelle im Level of Detail 2 (LoD 2)', license: 'dl-de/by-2-0', link: 'https://www.berlin.de/sen/sbw/stadtdaten/geoportal/geoportal-daten-und-dienste/'},
  HB: {attribution: 'Landesamt GeoInformation Bremen', license: 'cc/by-4-0', link: 'https://geoportal.bremen.de/geoportal/'},
  HE: {attribution: 'Hessische Verwaltung für Bodenmanagement und Geoinformation', license: 'dl-de/zero-2-0', link: 'https://gds.hessen.de/INTERSHOP/web/WFS/HLBG-Geodaten-Site/de_DE/-/EUR/ViewDownloadcenter-Start?path=3D-Daten/3D-Geb%C3%A4udemodelle/3D-Geb%C3%A4udemodelle%20LoD2'},
  HH: {attribution: 'Freie und Hansestadt Hamburg, Landesbetrieb Geoinformation und Vermessung (LGV)', license: 'dl-de/by-2-0', link: 'https://metaver.de/trefferanzeige?docuuid=2C1F2EEC-CF9F-4D8B-ACAC-79D8C1334D5E&q=3D-Geb%C3%A4udemodell+LoD2&f=type%3Aopendata%3B'},
  NI: {attribution: 'LGLN 2024', license: 'cc/by-4-0', link: 'https://metaver.de/trefferanzeige?docuuid=6c1ab9c0-02c0-4f0d-98af-caf9fec83cc3&q=3D-Geb%C3%A4udemodell+LoD2&rstart=10&f=type%3Aopendata%3B'},
  NW: {attribution: 'Geobasis NRW', license: 'dl-de/zero-2-0', link: 'https://www.geoportal.nrw/?activetab=map#/datasets/iso/5d9a8abc-dfd0-4dda-b8fa-165cce4d8065'},
  ST: {attribution: 'GeoBasis-DE/LVermGeo ST', license: 'dl-de/by-2-0', link: 'https://metaver.de/trefferanzeige?docuuid=4D2501AB-6888-4B8A-A706-6B0755947B13&q=3D-Geb%C3%A4udemodell+LoD2&f=type%3Aopendata%3B'},
  TH: {attribution: 'GDI-Th', license: 'dl-de/by-2-0', link: 'https://geoportal.thueringen.de/gdi-th/download-offene-geodaten/download-3d-gebaeudedaten'},
  RP: {attribution: 'GeoBasis-DE/LVermGeoRP (2024)', license: 'dl-de/by-2-0', link: 'https://metaportal.rlp.de/gui/html/0b28684d-b2ce-4b0b-b080-928025588c61'},
  SH: {attribution: 'GeoBasis-DE/LVermGeo SH', license: 'cc/by-4-0', link: 'https://geodaten.schleswig-holstein.de/gaialight-sh/_apps/dladownload/dl-lod2.html'},
  SN: {attribution: 'Landesamt für Geobasisinformation Sachsen (GeoSN)', license: 'dl-de/by-2-0', link: 'https://www.geodaten.sachsen.de/downloadbereich-digitale-3d-stadtmodelle-4875.html'},
};

const license_links = {
  'dl-de/by-2-0': 'https://www.govdata.de/dl-de/by-2-0',
  'dl-de/zero-2-0': 'https://www.govdata.de/dl-de/zero-2-0',
  'cc/by-4-0': 'https://creativecommons.org/licenses/by/4.0/deed',
}
