import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react"

import Main from "../Main"

const Datenschutz = () => {
  return (
    <Main class="text" title="Datenschutz" description="Datenschutzerklaerung der Website.">
      <Card>
        <CardHeader>
          <Heading><Link to="/datenschutz">Datenschutz</Link></Heading>
        </CardHeader>
        <CardBody>
          <h1>Datenschutzerklärung</h1>
          <p>
            Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der
            EU-Datenschutzgrundverordnung (DSGVO), ist:
          </p>
          <p>
            Florian Kotthoff <br />
            Arnulfstraße 138 <br />
            80634 München
            <br />
            info@openpv.de
          </p>
          <h2>Ihre Betroffenenrechte</h2>
          <p>
            Unter den angegebenen Kontaktdaten unseres Datenschutzbeauftragten
            können Sie jederzeit folgende Rechte ausüben:
          </p>
          <ul>
            <li>
              Auskunft über Ihre bei uns gespeicherten Daten und deren
              Verarbeitung (Art. 15 DSGVO),
            </li>
            <li>
              Berichtigung unrichtiger personenbezogener Daten (Art. 16 DSGVO),
            </li>
            <li>Löschung Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO),</li>
            <li>
              Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund
              gesetzlicher Pflichten noch nicht löschen dürfen (Art. 18 DSGVO),
            </li>
            <li>
              Widerspruch gegen die Verarbeitung Ihrer Daten bei uns (Art. 21
              DSGVO) und
            </li>
            <li>
              Datenübertragbarkeit, sofern Sie in die Datenverarbeitung
              eingewilligt haben oder einen Vertrag mit uns abgeschlossen haben
              (Art. 20 DSGVO).
            </li>
          </ul>
          <p>
            Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese
            jederzeit mit Wirkung für die Zukunft widerrufen.
          </p>
          <p>
            Sie können sich jederzeit mit einer Beschwerde an eine
            Aufsichtsbehörde wenden, z. B. an die zuständige Aufsichtsbehörde des
            Bundeslands Ihres Wohnsitzes oder an die für uns als verantwortliche
            Stelle zuständige Behörde.
          </p>
          <p>
            Eine Liste der Aufsichtsbehörden (für den nichtöffentlichen Bereich)
            mit Anschrift finden Sie unter:{" "}
            <a
              href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html"
              target="_blank"
              rel="noopener nofollow"
            >
              https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html
            </a>
            .
          </p>
          <p></p>
          <h2>Erfassung allgemeiner Informationen beim Besuch unserer Website</h2>
          <h3>Art und Zweck der Verarbeitung:</h3>
          <p>
            Wenn Sie auf unsere Website zugreifen, d.h., wenn Sie sich nicht
            registrieren oder anderweitig Informationen übermitteln, werden
            automatisch Informationen allgemeiner Natur erfasst. Diese
            Informationen (Server-Logfiles) beinhalten etwa die Art des
            Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres
            Internet-Service-Providers, Ihre IP-Adresse und ähnliches.{" "}
          </p>
          <p>Sie werden insbesondere zu folgenden Zwecken verarbeitet:</p>
          <ul>
            <li>
              Sicherstellung eines problemlosen Verbindungsaufbaus der Website,
            </li>
            <li>Sicherstellung einer reibungslosen Nutzung unserer Website,</li>
            <li>Auswertung der Systemsicherheit und -stabilität sowie</li>
            <li>zur Optimierung unserer Website.</li>
          </ul>
          <p>
            Wir verwenden Ihre Daten nicht, um Rückschlüsse auf Ihre Person zu
            ziehen. Informationen dieser Art werden von uns ggfs. anonymisiert
            statistisch ausgewertet, um unseren Internetauftritt und die
            dahinterstehende Technik zu optimieren.{" "}
          </p>
          <h3>Rechtsgrundlage und berechtigtes Interesse:</h3>
          <p>
            Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO auf Basis
            unseres berechtigten Interesses an der Verbesserung der Stabilität und
            Funktionalität unserer Website.
          </p>
          <h3>Empfänger:</h3>
          <p>
            Empfänger der Daten sind ggf. technische Dienstleister, die für den
            Betrieb und die Wartung unserer Webseite als Auftragsverarbeiter tätig
            werden.
          </p>
          <p></p>
          <h3>Drittlandtransfer:</h3>
          <p>Die erhobenen Daten werden nicht in Drittländer übertragen. </p>
          <p></p>
          <h3>Speicherdauer:</h3>
          <p>
            Die Daten werden gelöscht, sobald diese für den Zweck der Erhebung
            nicht mehr erforderlich sind. Dies ist für die Daten, die der
            Bereitstellung der Website dienen, grundsätzlich der Fall, wenn die
            jeweilige Sitzung beendet ist.{" "}
          </p>
          <p>
            {" "}
            Im Falle der Speicherung der Daten in Logfiles ist dies nach
            spätestens 14 Tagen der Fall. Eine darüberhinausgehende Speicherung
            ist möglich. In diesem Fall werden die IP-Adressen der Nutzer
            anonymisiert, sodass eine Zuordnung des aufrufenden Clients nicht mehr
            möglich ist.
          </p>
          <p></p>
          <h3>Bereitstellung vorgeschrieben oder erforderlich:</h3>
          <p>
            Die Bereitstellung der vorgenannten personenbezogenen Daten ist weder
            gesetzlich noch vertraglich vorgeschrieben. Ohne die IP-Adresse ist
            jedoch der Dienst und die Funktionsfähigkeit unserer Website nicht
            gewährleistet. Zudem können einzelne Dienste und Services nicht
            verfügbar oder eingeschränkt sein. Aus diesem Grund ist ein
            Widerspruch ausgeschlossen.{" "}
          </p>
          <p></p>
          <h3>Plugins und Tools</h3>
          <p>
            Nominatim Geocoding <br />
            Diese Seite nutzt über eine API Nominatim, den Geocoding Dienst von
            OpenStreetMaps.nominatim.openstreetmap.org Zur Nutzung der
            GeoCodingFunktion bei der Umwandlung ihrer Adresse in Koordinaten
            werden die eingegebenen Adressdaten an Nominatim zur
            Koordinatenermittlung übermittelt. Die Nutzung von Nominatim erfolgt
            im Interesse einer ansprechenden Darstellung unserer Online-Angebote
            und an einer leichten Auffindbarkeit der von uns simulierten
            PV-Erträge auf der Website. Dies stellt ein berechtigtes Interesse im
            Sinne von Art. 6 Abs. 1 lit. f DSGVO dar. Mehr Informationen zum
            Umgang mit Nutzerdaten finden Sie in der Datenschutzerklärung von
            OpenStreetMaps: https://wiki.osmfoundation.org/wiki/Privacy_Policy
          </p>
          <hr />
          <h2>Information über Ihr Widerspruchsrecht nach Art. 21 DSGVO</h2>
          <h3>Einzelfallbezogenes Widerspruchsrecht</h3>
          <p>
            Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen
            Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender
            personenbezogener Daten, die aufgrund Art. 6 Abs. 1 lit. f DSGVO
            (Datenverarbeitung auf der Grundlage einer Interessenabwägung)
            erfolgt, Widerspruch einzulegen; dies gilt auch für ein auf diese
            Bestimmung gestütztes Profiling im Sinne von Art. 4 Nr. 4 DSGVO.
          </p>
          <p>
            Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten
            nicht mehr verarbeiten, es sei denn, wir können zwingende
            schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre
            Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung
            dient der Geltendmachung, Ausübung oder Verteidigung von
            Rechtsansprüchen.
          </p>
          <h3>Empfänger eines Widerspruchs</h3>
          <p>
            Florian Kotthoff <br />
            Arnulfstraße 138 <br />
            80634 München <br />
            info@openpv.de
          </p>
          <hr />
          <h2>Änderung unserer Datenschutzbestimmungen</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie
            stets den aktuellen rechtlichen Anforderungen entspricht oder um
            Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen,
            z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt
            dann die neue Datenschutzerklärung.
          </p>
          <h2>Fragen an den Datenschutzbeauftragten</h2>
          <p>
            Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine
            E-Mail oder wenden Sie sich direkt an die für den Datenschutz
            verantwortliche Person in unserer Organisation:
          </p>
          <p>
            <em>
              Die Datenschutzerklärung wurde mithilfe der activeMind AG erstellt,
              den Experten für{" "}
              <a
                href="https://www.activemind.de/datenschutz/datenschutzbeauftragter/"
                target="_blank"
                rel="noopener"
              >
                externe Datenschutzbeauftragte
              </a>{" "}
              (Version #2020-09-30).
            </em>
          </p>
        </CardBody>
      </Card>
    </Main>
  )
}

export default Datenschutz
