import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Image,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import Footer from "../components/ThreeViewer/Footer"

import Main from "../Main"

const About = () => {
  const { t } = useTranslation()
  return (
    <>
      <Main title={t("about.title")} description={t("about.description")}>
        <Card height="100%" overflow="auto">
          <CardHeader>
            <Heading>{t("about.description")}</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing="6" align="start">
              <TextBox
                heading={t("about.generalDescription.h")}
                content={t("about.generalDescription.p")}
              >
                <Text>{t("about.advantages.introduction")}</Text>
                <UnorderedList>
                  <ListItem>{t("about.advantages.1")}</ListItem>
                  <ListItem>{t("about.advantages.2")}</ListItem>
                  <ListItem>{t("about.advantages.3")}</ListItem>
                </UnorderedList>
              </TextBox>
              <ImageRow
                images={[
                  "images/about/about1.png",
                  "images/WelcomeMessage2.png",
                  "images/WelcomeMessage3.png",
                ]}
              />
              <TextBox heading={t("about.data.h")}>
                {t("about.data.p1")}{" "}
                <Link
                  href="https://www.dwd.de/DE/leistungen/cdc/climate-data-center.html"
                  isExternal
                  color="teal"
                >
                  {"[CC-BY-4.0]"}
                </Link>
                {", "}
                {t("about.data.p2")}{" "}
                <Link href="https://sonny.4lima.de/" isExternal color="teal">
                  {"[CC-BY-4.0]"}
                </Link>
                {", "}
                {t("about.data.p3")}{" "}
                <Link
                  href="https://www.bkg.bund.de/DE/Home/home.html"
                  isExternal
                  color="teal"
                >
                  {"[DL-DE/BY-2-0]"}
                </Link>
                .
              </TextBox>
              <TextBox
                heading={t("about.whyOpenSource.h")}
                content={t("about.whyOpenSource.p")}
              />

              <TextBox heading={t("about.team.h")} content={t("about.team.p")}>
                <Link
                  href="https://github.com/orgs/open-pv/people"
                  isExternal
                  color="teal"
                >
                  {t("about.team.link")}
                </Link>
              </TextBox>

              <TextBox
                heading={t("about.sponsors.h")}
                content={t("about.sponsors.p")}
              />
              <ImageRow
                images={["images/about/ptf.png", "images/about/bmbf.jpg"]}
                links={["https://prototypefund.de/", "https://www.bmbf.de"]}
                objectFit="contain"
              />
            </VStack>
          </CardBody>
        </Card>
      </Main>
      <Footer />
    </>
  )
}

export default About

function TextBox({ content, heading, children }) {
  return (
    <Box>
      <Heading as="h3" size="md">
        {heading}
      </Heading>
      <Text>{content}</Text>
      {children}
    </Box>
  )
}

const ImageRow = ({ images, links = [], objectFit = "cover" }) => {
  return (
    <SimpleGrid columns={images.length} spacing={4}>
      {images.map((src, index) => {
        const imageContent = (
          <Image
            src={src}
            objectFit={objectFit}
            width="100%"
            height="150px"
            borderRadius="md"
          />
        )

        return (
          <Box key={index} padding={2}>
            {links[index] ? (
              <Link href={links[index]} isExternal>
                {imageContent}
              </Link>
            ) : (
              imageContent
            )}
          </Box>
        )
      })}
    </SimpleGrid>
  )
}