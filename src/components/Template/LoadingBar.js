import PropTypes from "prop-types"
import React from "react"
import { useTranslation } from "react-i18next"

const LoadingBar = ({ progress }) => {
  const { t, i18n } = useTranslation()
  const numberTips = 3
  const shownTip = Math.floor(Math.random() * numberTips) + 1

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  }

  const barContainerStyle = {
    width: "80%",
    backgroundColor: "#e0e0df",
    borderRadius: "5px",
    overflow: "hidden",
  }

  const barStyle = {
    width: `${progress}%`,
    height: "20px",
    backgroundColor: "#76c7c0",
  }

  return (
    <div style={containerStyle}>
      <p>{t("loadingMessage.tip" + shownTip.toString())}</p>
      <div style={barContainerStyle}>
        <div style={barStyle}></div>
      </div>
    </div>
  )
}

LoadingBar.propTypes = {
  progress: PropTypes.number.isRequired,
}

export default LoadingBar
