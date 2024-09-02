import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import i18n from "i18next"
import React from "react"
import { useTranslation } from "react-i18next"
import { attributions, licenseLinks } from "../data/dataLicense"

const WrapperForLaptopDevice = ({ children }) => {
  return (
    <div className="overlay">
      <div className="attribution">{children}</div>
    </div>
  )
}

const WrapperForTouchDevice = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <div className="overlay">
      <div className="attribution">
        <Button onClick={onOpen}>License Information</Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>License Information</ModalHeader>
            <ModalCloseButton />
            <ModalBody>{children}</ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}

export default function Footer({ federalState, frontendState }) {
  const attr = federalState ? attributions[federalState] : undefined
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
  const { t } = useTranslation()

  const Wrapper = window.isTouch
    ? WrapperForTouchDevice
    : WrapperForLaptopDevice

  const footerContent = (
    <>
      {(frontendState == "Map" ||
        frontendState == "Results" ||
        frontendState == "DrawPV") && (
        <p key="map-attribution" className="copyright">
          Basiskarte &copy;{" "}
          <a href="https://www.bkg.bund.de" target="_blank">
            BKG
          </a>
          &nbsp;(
          <a href="https://www.govdata.de/dl-de/by-2-0" target="_blank">
            dl-de/by-2-0
          </a>
          ) | Geländemodell:&nbsp;
          <a href="https://sonny.4lima.de" target="_blank">
            &copy;&nbsp;Sonny
          </a>
          &nbsp;(
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.en"
            target="_blank"
          >
            CC-BY-4.0
          </a>
          ), erstellt aus
          <a
            href="https://drive.google.com/file/d/1rgGA22Ha42ulQORK9Pfp4JPpPAIKFx6Q/view"
            target="_blank"
          >
            verschiedenen Quellen
          </a>
        </p>
      )}
      {federalState && (
        <>
          <p
            key={federalState}
            className="copyright"
            style={federalState ? {} : { display: "none" }}
          >
            Geb&auml;udedaten &copy;{" "}
            <a href={attr.link} target="_blank">
              {attr.attribution}
            </a>
            &nbsp;(
            <a href={licenseLinks[attr.license]} target="_blank">
              {attr.license}
            </a>
            )
          </p>
        </>
      )}
      <p className="copyright">
        &copy;&nbsp;
        <a href="https://github.com/open-pv" target="_blank">
          Team OpenPV
        </a>
        {" | "}
        <a href="https://html5up.net" target="_blank">
          Website Template
        </a>
        {" | "}
        <a href="/Impressum">Impressum</a>
        {" | "}
        <a href="/Datenschutz">{t("Footer.privacyPolicy")}</a>
        {" | "}
        <a
          href=""
          onClick={(e) => {
            e.preventDefault()
            changeLanguage("en")
          }}
        >
          English
        </a>
        {" | "}
        <a
          href=""
          onClick={(e) => {
            e.preventDefault()
            changeLanguage("de")
          }}
        >
          German
        </a>
      </p>
    </>
  )

  return <Wrapper>{footerContent}</Wrapper>
}
