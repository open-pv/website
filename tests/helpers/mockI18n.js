import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Create a simplified i18n instance for testing
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          'Search': 'Search',
          'title': 'OpenPV',
          'mainDescription': 'Calculate solar potential for buildings in Germany',
          'searchField.placeholder': 'Enter address...',
          'searchButton': 'Search',
          'simulate': 'Simulate',
          'about': 'About',
          'privacy': 'Privacy',
          'legal': 'Legal',
          'Team OpenPV': 'Team OpenPV',
          'Loading': 'Loading',
          'Error': 'Error',
          'No buildings found': 'No buildings found',
        }
      },
      de: {
        translation: {
          'Search': 'Suchen',
          'title': 'OpenPV',
          'mainDescription': 'Berechne Solarpotenzial für Gebäude in Deutschland',
          'searchField.placeholder': 'Adresse eingeben...',
          'searchButton': 'Suchen',
          'simulate': 'Simulieren',
          'about': 'Über',
          'privacy': 'Datenschutz',
          'legal': 'Impressum',
          'Team OpenPV': 'Team OpenPV',
          'Loading': 'Laden',
          'Error': 'Fehler',
          'No buildings found': 'Keine Gebäude gefunden',
        }
      }
    }
  })

export default i18n
