import React from "react"
import { useTranslation } from "react-i18next"
import ContactIcons from "../Contact/ContactIcons"
import DatesSlider from "../PVSimulation/DatesSlider"
import DistanceSlider from "../PVSimulation/DistanceSlider"
import RadiusSlider from "../PVSimulation/RadiusSlider"
import SidebarFooter from "./SideBarFooter"

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
        <p>{t("sidebar.mainText")}</p>
        <DatesSlider></DatesSlider>
        <RadiusSlider></RadiusSlider>
        <DistanceSlider></DistanceSlider>
        <p id="status">{t("simulationStatus.waitingForAdress")}</p>
      </section>

      <section id="footer">
        <ContactIcons />
        <SidebarFooter />
      </section>
    </section>
  )
}

export default SideBar
