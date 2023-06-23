import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';

import Main from '../layouts/Main';

const About = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    import('../data/description.md')
      .then((res) => {
        fetch(res.default)
          .then((r) => r.text())
          .then(setMarkdown);
      });
  });

  const count = markdown.split(/\s+/)
    .map((s) => s.replace(/\W/g, ''))
    .filter((s) => s.length).length;

  return (
    <Main
      title="Anleitung"
      description="So gehst du vor, um das Solarpotential deines Hauses zu berechnen."
    >
      <article className="post markdown" id="about">
        <header>
          <div className="title">
            <h2><Link to="/anleitung">Anleitung für das Bedienen der Website</Link></h2>
            <p>Nur {count} Wörter lang ;)</p>
          </div>
        </header>
        <Markdown>
          {markdown}
        </Markdown>
      </article>
    </Main>
  );
};

export default About;