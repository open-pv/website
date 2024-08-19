import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

import Main from "../Main"

const About = () => {
  const { t, i18n } = useTranslation()
  return (
    <Main title={t("about.title")} description={t("about.description")}>
      <Card>
        <CardHeader>
          <Heading>{t("about.h2")}</Heading>
        </CardHeader>
        <CardBody>
          <p>{t("about.p-1")}</p>
          <br />
          <h3>{t("about.h3-2")}</h3>
          <p>{t("about.p-2")}</p>
          <br />
          <h3>{t("about.h3-3")}</h3>
          <p>{t("about.p-3")}</p>
          <br />
          <h3>{t("about.h3-4")}</h3>
          <p>{t("about.p-4")}</p>
          <br />
          <h3>{t("about.h3-5")}</h3>
          <p>{t("about.p-5")}</p>
        </CardBody>
      </Card>
    </Main>
  )
}

export default About
