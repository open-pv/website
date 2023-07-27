import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import React from "react";
import { useTranslation } from "react-i18next";

export const Driver = () => {
  const { t, i18n } = useTranslation();
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: "—›",
      prevBtnText: "‹—",
      doneBtnText: "✕",
      showProgress: true,
      steps: [
        {
          element: "#search-field",
          popover: {
            title: t("driver.searchfieldTitle"),
            description: t("driver.searchFieldDescription"),
            side: "right",
            align: "start",
          },
        },
        {
          element: "#sidebar-slider",
          popover: {
            title: t("driver.sliderTitle"),
            description: t("driver.sliderDescription"),
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/about"]',
          popover: {
            title: t("driver.moreInformationTitle"),
            description: t("driver.moreInformationDescription"),
            side: "right",
            align: "start",
          },
        },
      ],
    });
    driverObj.drive();
  };
  return <button onClick={startTour}>{t("driver.button")}</button>;
};
