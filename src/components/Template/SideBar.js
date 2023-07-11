import React, { useState } from "react";
import ContactIcons from "../Contact/ContactIcons";
import DatesSlider from "../PVSimulation/DatesSlider";
import RadiusSlider from "../PVSimulation/RadiusSlider";
import DistanceSlider from "../PVSimulation/DistanceSlider";

const SideBar = () => {
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState(false);
  return (
  <section id="sidebar">
    <section id="intro">
      <header>
        <h2>Anleitung</h2>
      </header>
    </section>
    <section className="blurb">
      <p>
        Im Suchfeld einfach deine Adresse oder deine Koordinaten eingeben. Wir
        berechnen dann das Potential für eine Solaranlage auf deiner Dach- und
        Fassadenfläche.
      </p>
      <p>Der Service funktioniert aktuell nur für Gebäude in Bayern.</p>
      <button onClick={() => setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible)}>Weitere Optionen</button>
      {isAdvancedOptionsVisible && 
      <>
      <DatesSlider/>
      <RadiusSlider/>
      <DistanceSlider/>
      </>
      }
      <p id="status">Warte auf Adresseingabe</p>
    </section>

    <section id="footer">
      <ContactIcons />
      <p className="copyright">
        &copy; Erstellt von Flo, Martin und Korbi,{" "}
        <a href="/Impressum">Impressum</a>.
      </p>
    </section>
  </section>
)
};

export default SideBar;
