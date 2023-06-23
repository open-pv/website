import React, { useState } from 'react';
import SearchField from '../components/PVSimulation/SearchField';

import Main from '../layouts/Main';
import ThreeViewer from '../components/ThreeViewer/ThreeViewer';
import ViridisLegend from '../components/ThreeViewer/ViridisLegend';

function Index () {
  const [showThreeViewer, setShowThreeViewer] = useState(true);
  const [showViridisLegend, setShowViridisLegend] = useState(false);
  window.setShowThreeViewer = setShowThreeViewer;
  window.setShowViridisLegend = setShowViridisLegend;
  return (
  <Main
    description={'Berechne das Potential deiner Solaranlage.'}
  >
    <article className="post" id="index">
      <header>
        <div className="title">
          <SearchField/>
          
        </div>
      </header>
      {showThreeViewer && <ThreeViewer/>}
      {showViridisLegend && <ViridisLegend/>}
    </article>
    
  </Main>
);
  }

export default Index;
