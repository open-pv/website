import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import routes from "../../data/routes"
import Hamburger from "./Hamburger"

// Websites Navbar, displays routes defined in 'src/data/routes'
const Navigation = () => {
  const { t, i18n } = useTranslation()

  return (
    <header id="header">
      <h1 className="index-link">
        {routes
          .filter((l) => l.index)
          .map((l) => (
            <Link key={l.label} to={l.path}>
              {l.label}
            </Link>
          ))}
      </h1>

      <nav className="links">
        <ul>
          {routes
            .filter((l) => !l.index)
            .map((l) => (
              <li key={l.label}>
                <Link to={l.path}>
                  {l.labelKey == null ? l.label : t(l.labelKey)}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <Hamburger />
    </header>
  )
}

export default Navigation
