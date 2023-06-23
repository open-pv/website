import React from 'react';

function WrongAdress () {
        return (
            <div style={{alignItems: 'center'}}>
              <p>
                Adresse wurde nicht gefunden oder liegt nicht innerhalb von Bayern. Leider können wir aktuell nur Häuser in Bayern simulieren. 
              </p>
              <p>
                Alternativ kannst du auch die Koordinaten in Google Maps per Rechtsklick bestimmen und in das Suchfeld eingeben.
              </p>
              <img src="images/googleMaps.gif" alt="Showing how to get coordinates from Google Maps" style={{ width: '100%', maxWidth: '500px' }} />
            </div>
          );
    }

export default WrongAdress;
