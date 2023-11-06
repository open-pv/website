import { useTranslation } from "react-i18next"

export default function SidebarFooter() {
  const { i18n } = useTranslation()

  const changeLanguage = (language) => {
    i18n.changeLanguage(language)
  }

  return (
    <p className="copyright">
      &copy; Erstellt von Florian, Martin und Korbinian,{" "}
      <a href="/Impressum">Impressum</a>
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
  )
}
