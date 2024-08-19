import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

import Main from "../Main"

const About = () => {
  const { t } = useTranslation()
  return (
    <Main title={t("about.title")} description={t("about.description")}>
      <Card height="100%" overflow="auto">
        <CardHeader>
          <Heading>{t("about.description")}</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing="4">
            <TextBox heading={t("about.h1")} content={t("about.p1")} />
            <TextBox heading={t("about.h2")} content={t("about.p2")} />
            <TextBox heading={t("about.h3")} content={t("about.p3")} />
            <TextBox heading={t("about.h4")} content={t("about.p4")} />
          </Stack>
        </CardBody>
      </Card>
    </Main>
  )
}

export default About

function TextBox({ content, heading }) {
  return (
    <Box>
      <Heading as="h3" size="md">
        {heading}
      </Heading>
      <Text>{content}</Text>
    </Box>
  )
}
