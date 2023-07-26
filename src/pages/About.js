import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import Main from "../layouts/Main"

const About = () => {
  const { t, i18n } = useTranslation()
  return (
    <Main title={t("about.title")} description={t("about.description")}>
      <article className="post markdown" id="about">
        <header>
          <div className="title">
            <h2>
              <Link to="/about">{t("about.h2")}</Link>
            </h2>
          </div>
        </header>
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
      </article>
    </Main>
  )
}

export default About
