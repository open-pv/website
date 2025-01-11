import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

function WrongAdress() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <Heading>{t("errorMessage.header")}</Heading>
      </CardHeader>
      <CardBody>{t("errorMessage.wrongAdress")}</CardBody>
    </Card>
  )
}

export default WrongAdress
