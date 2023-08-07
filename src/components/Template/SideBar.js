import React from "react"
import { useTranslation } from "react-i18next"
import ContactIcons from "../Contact/ContactIcons"
import DatesSlider from "../PVSimulation/DatesSlider"
import DistanceSlider from "../PVSimulation/DistanceSlider"
import { EnableLaserPointsSwitch } from "../PVSimulation/EnableLaserPointsSwitch"
import RadiusSlider from "../PVSimulation/RadiusSlider"
import VisualizeLaserPointsSlider from "../PVSimulation/VisualizeLaserPointsSlider"
import { Driver } from "./Driver"
import SidebarFooter from "./SideBarFooter"

const SideBar = () => {
  const { t, i18n } = useTranslation()

  return (
    <section id="sidebar">
      <section id="intro">
        <Driver />
      </section>
      <section className="blurb">
        <p>{t("sidebar.mainText")}</p>

        <div id="sidebar-slider" style={{ position: "relative" }}>
          <DatesSlider></DatesSlider>
          <RadiusSlider></RadiusSlider>
          <DistanceSlider></DistanceSlider>
          <EnableLaserPointsSwitch />
          <VisualizeLaserPointsSlider></VisualizeLaserPointsSlider>
        </div>
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
