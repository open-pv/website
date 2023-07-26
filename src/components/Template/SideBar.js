import React from "react"
import { useTranslation } from "react-i18next"
import ContactIcons from "../Contact/ContactIcons"
import DatesSlider from "../PVSimulation/DatesSlider"
import DistanceSlider from "../PVSimulation/DistanceSlider"
import RadiusSlider from "../PVSimulation/RadiusSlider"

const SideBar = () => {
  const { t, i18n } = useTranslation()
  return (
    <section id="sidebar">
      <section id="intro">
        <header>
          <h2>{t("sidebar.header")}</h2>
        </header>
      </section>
      <section className="blurb">
        <p>
          Im Suchfeld deine Adresse oder Koordinaten eingeben. Das Tool
          berechnet dann das Potential für eine Solaranlage auf deiner Dach- und
          Fassadenfläche.
        </p>
        <p>Der Service funktioniert aktuell nur für Gebäude in Bayern.</p>
        <DatesSlider></DatesSlider>
        <RadiusSlider></RadiusSlider>
        <DistanceSlider></DistanceSlider>
        {/* <DraggableCircle></DraggableCircle> */}
        <p id="status">Warte auf Adresseingabe</p>
      </section>

      <section id="footer">
        <ContactIcons />
        <p className="copyright">
          &copy; Erstellt von Florian, Martin und Korbinian,{" "}
          <a href="/Impressum">Impressum</a>.
        </p>
      </section>
    </section>
  )
}

export default SideBar
