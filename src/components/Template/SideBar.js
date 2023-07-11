import React, { useRef } from "react";
import ContactIcons from "../Contact/ContactIcons";
import DatesSlider from "../PVSimulation/DatesSlider";
import RadiusSlider from "../PVSimulation/RadiusSlider";
import DistanceSlider from "../PVSimulation/DistanceSlider";
import DraggableCircle from "../PVSimulation/DirectionSlider";

const SideBar = () => (
  <section id="sidebar">
    <section id="intro">
      <header>
        <h2>Ziel des Tools</h2>
      </header>
    </section>
    <section className="blurb">
      <p>
        Im Suchfeld Ihre Adresse oder Koordinaten eingeben. Das Tool berechnet 
        dann das Potential für eine Solaranlage auf Ihrer Dach- und Fassadenfläche.
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
      <p className="copyright">&copy; Erstellt von Florian, Martin und Korbinian, <a href='/Impressum'>Impressum</a>.</p>
    </section>
  </section>
);

export default SideBar;
