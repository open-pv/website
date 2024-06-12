import React from "react"
import { useTranslation } from "react-i18next"

function TooManyUniforms() {
  const { t, i18n } = useTranslation()
  return (
    <div style={{ alignItems: "center" }}>
      <p>{t("errorMessage.tooManyUniforms")}</p>
    </div>
  )
}

export default TooManyUniforms