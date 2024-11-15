import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react"

import Main from "../Main"

const Datenschutz = () => {
  return (
    <Main title="Datenschutz" description="Datenschutzerklaerung der Website.">
      <Card height="100%" overflow="auto">
        <CardHeader>
          <Heading as="h1">Datenschutz</Heading>
        </CardHeader>
        <CardBody>
          <h1>Datenschutzerklärung</h1>
          <p>
            Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der
            EU-Datenschutzgrundverordnung (DSGVO), ist:
          </p>
          <p>
            Großhauser Heidler Kotthoff Pöppel GbR <br />p r i v a c y @ o p e n
            p v . d e
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
              Einschränkung der Datenverarbeitung, sofern wir Ihre Daten
              aufgrund gesetzlicher Pflichten noch nicht löschen dürfen (Art. 18
              DSGVO),
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
            Aufsichtsbehörde wenden, z. B. an die zuständige Aufsichtsbehörde
            des Bundeslands Ihres Wohnsitzes oder an die für uns als
            verantwortliche Stelle zuständige Behörde.
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
          <h2>
            Erfassung allgemeiner Informationen beim Besuch unserer Website
          </h2>
          <h3>Art und Zweck der Verarbeitung:</h3>
          <ul>
            <li>
              Verkehrsdaten (wie zB IP-Adresse): Wenn Sie auf unsere Website
              zugreifen, werden automatisch Informationen allgemeiner Natur
              erfasst. Diese Informationen (Server-Logfiles) beinhalten die Art
              des Webbrowsers, das verwendete Betriebssystem, den Domainnamen
              Ihres Internet-Service-Providers, Ihre IP-Adresse und ähnliches.
              Ohne die IP-Adresse ist der Dienst und die Funktionsfähigkeit
              unserer Website nicht gewährleistet. Zudem können einzelne Dienste
              und Services nicht verfügbar oder eingeschränkt sein. Der Zweck
              dieser Datenverarbeitung ist die Sicherstellung eines problemlosen
              Verbindungsaufbaus der Website, Sicherstellung einer reibungslosen
              Nutzung unserer Website, Auswertung der Systemsicherheit und
              -stabilität sowie zur Optimierung unserer Website.
            </li>
            <li>
              Adresse und Koordinaten: Die Adresse, welche Sie in die Suchmaske
              eingeben, wird an Nominatim zur Koordinatenermittlung übermittelt.
              Weitere Infos zu Nominatim finden Sie unter dem Abschnitt "Plugins
              und Tools". Zur automatischen Adressvervollständigung wird die
              Eingabe in das Suchfeld an https://photon.komoot.io/ gesendet.
              Weitere Infos zu Photon von Komoot finden Sie unter dem Abschnitt
              "Plugins und Tools". Die Koordinaten werden verwendet, um die
              relevanten Gebäude und Geländedaten von unserem Server zu laden.
              Die genauen Koordinaten werden nicht auf unserem Server
              gespeichert. Zu statistischen Zwecken und zur Optimierung unseres
              Angebotes speichern wir die Region (gerundete Koordinaten) der
              angefragten Adresse (aufgelöst auf wenige Kilometer).
            </li>
          </ul>
          <p>
            Wir verwenden Ihre Daten nicht, um Rückschlüsse auf Ihre Person zu
            ziehen.
          </p>
          <h3>Rechtsgrundlage und berechtigtes Interesse:</h3>
          <p>
            Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO auf Basis
            unseres berechtigten Interesses an der Verbesserung der Stabilität
            und Funktionalität unserer Website.
          </p>
          <h3>Empfänger:</h3>
          <p>
            Empfänger der Daten sind technische Dienstleister, die den Betrieb
            unserer Server ermöglichen. Diese Dienstleister sind die netcup GmbH
            und Hetzner Online GmbH.
          </p>
          <h3>Drittlandtransfer:</h3>
          <p>
            Unsere eigene Datenverarbeitung findet in Deutschland statt. Für die
            Konvertierung von Adresse in Koordinaten werden Daten über Nominatim
            in Drittländern (Stand August 2024: Niederlande und UK) verarbeitet.
            Eine Auflistung dieser Drittländer finden Sie hier:
            https://osmfoundation.org/wiki/Privacy_Policy#Where_do_we_store_the_data
          </p>
          <p></p>
          <h3>Speicherdauer:</h3>
          <p>
            Die Daten werden gelöscht, sobald diese für den Zweck der Erhebung
            nicht mehr erforderlich sind. Dies ist für die Daten, die der
            Bereitstellung der Website dienen, grundsätzlich der Fall, wenn die
            jeweilige Sitzung beendet ist.
          </p>
          <p>
            Im Falle der Speicherung der Verkehrsdaten in Logfiles ist dies nach
            14 Tagen der Fall, es sei denn, es gibt einen besonderen Grund,
            Informationen länger aufzubewahren (z.B. wenn einzelne IP-Adressen
            gesperrt werden).
          </p>

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
            PV-Erträge auf der Website. Dies stellt ein berechtigtes Interesse
            im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar. Mehr Informationen zum
            Umgang mit Nutzerdaten finden Sie in der Datenschutzerklärung von
            OpenStreetMaps: https://wiki.osmfoundation.org/wiki/Privacy_Policy
          </p>
          <br />
          <p>
            Photon von Komoot <br />
            openpv nutzt die API von komoot zur automatischen
            Adressvervollständigung. Dabei werden die eingegebenen Buchstaben an
            https://photon.komoot.io/ gesendet. Die Auswahl einer finalen
            Adresse wird nicht an komoot mitgeteilt.
          </p>
          <hr />
          <h2>Information über Ihr Widerspruchsrecht nach Art. 21 DSGVO</h2>
          <h3>Einzelfallbezogenes Widerspruchsrecht</h3>
          <p>
            Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen
            Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender
            personenbezogener Daten, die aufgrund Art. 6 Abs. 1 lit. f DSGVO
            (Datenverarbeitung auf der Grundlage einer Interessenabwägung)
            erfolgt, Widerspruch einzulegen.
          </p>
          <p>
            Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten
            nicht mehr verarbeiten, es sei denn, wir können zwingende
            schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre
            Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung
            dient der Geltendmachung, Ausübung oder Verteidigung von
            Rechtsansprüchen.
          </p>
          <hr />
          <h2>Änderung unserer Datenschutzbestimmungen</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
            sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
            Änderungen unserer Leistungen in der Datenschutzerklärung
            umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren
            erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
          <h2>Fragen an den Datenschutzbeauftragten</h2>
          <p>
            Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine
            E-Mail oder wenden Sie sich direkt an die für den Datenschutz
            verantwortliche Person in unserer Organisation:
          </p>
          <p>
            <em>
              Die Datenschutzerklärung wurde mithilfe der activeMind AG
              erstellt, den Experten für{" "}
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
