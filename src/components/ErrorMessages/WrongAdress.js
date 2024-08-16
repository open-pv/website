import React from "react"
import { useTranslation } from "react-i18next"

function WrongAdress() {
  const { t, i18n } = useTranslation()
  return (
    <div className="error-message">
      <p>{t("errorMessage.wrongAdress")}</p>
      <img
        src="images/googleMaps.gif"
        alt="Showing how to get coordinates from Google Maps"
        style={{ width: "100%", maxWidth: "500px" }}
      />
    </div>
  )
}

export default WrongAdress
