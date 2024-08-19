import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Image,
  SimpleGrid,
  Stack,
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
            <ImageRow
              images={[
                "images/about/about1.png",
                "images/WelcomeMessage2.png",
                "images/WelcomeMessage3.png",
              ]}
            />
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

const ImageRow = ({ images }) => {
  return (
    <SimpleGrid columns={images.length} spacing={4}>
      {images.map((src, index) => (
        <Box key={index} padding={2}>
          <Image
            src={src}
            objectFit="cover"
            width="100%"
            height="150px"
            borderRadius="md"
          />
        </Box>
      ))}
    </SimpleGrid>
  )
}
