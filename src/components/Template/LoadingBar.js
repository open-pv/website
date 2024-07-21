import PropTypes from "prop-types"
import React from "react"

const LoadingBar = ({ progress }) => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
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
