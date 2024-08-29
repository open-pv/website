import { Card, CardBody, CardHeader, Heading, Image } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

function WrongAdress() {
  const { t, i18n } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <Heading>{t("errorMessage.header")}</Heading>
      </CardHeader>
      <CardBody>
        {t("errorMessage.wrongAdress")}
        <br />
        <br />
        <Image
          src="/images/googleMaps.gif"
          width="100%"
          maxWidth="500px"
          borderRadius="md"
          alt="A GIF that shows how you can get coordinates using Google Maps."
        />
      </CardBody>
    </Card>
  )
}

export default WrongAdress
