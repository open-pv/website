import PropTypes from "prop-types"
import React from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"

import Navigation from "../components/Template/Navigation"

const Footer = () => (
  <footer id="footer">
    <p className="copyright">
      &copy; Erstellt vom Team OpenPV, <a href="/Impressum">Impressum</a>
      {" | "}
      <a href="/Datenschutz">Datenschutz</a>
      {" | "}
      <a href="" onClick={() => changeLanguage("en")}>
        English
      </a>
      {" | "}
      <a href="" onClick={() => changeLanguage("de")}>
        German
      </a>
    </p>
  </footer>
)

const Main = (props) => (
  <HelmetProvider>
    <Helmet titleTemplate="%s | OpenPV" defaultTitle="OpenPV" defer={false}>
      {props.title && <title>{props.title}</title>}
      <meta name="description" content={props.description} />
    </Helmet>
    <div id="wrapper">
      <Navigation />
      <div id="main">
        {props.children}
        <Footer />
      </div>
    </div>
  </HelmetProvider>
)

Main.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  fullPage: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
}

Main.defaultProps = {
  children: null,
  fullPage: false,
  title: null,
  description: "Ermittle das Potential für eine Solaranlage.",
}

export default Main
