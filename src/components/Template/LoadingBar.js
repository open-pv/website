import { Progress } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const LoadingBar = ({ progress }) => {
  const { t } = useTranslation()
  const numberTips = 3
  const [shownTip, setShownTip] = useState(0)

  useEffect(() => {
    // Set a random tip when the component mounts
    const randomTip = Math.floor(Math.random() * numberTips) + 1
    setShownTip(randomTip)
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <p>{t("loadingMessage.tip" + shownTip.toString())}</p>
      <div style={{ width: "80%", maxWidth: "600px", margin: "0 auto" }}>
        <Progress value={progress} width="100%" hasStripe={true} />
      </div>
    </div>
  )
}

export default LoadingBar
