import React from 'react';
import { Button } from 'primereact/button';
import Table from './components/Table';
import ExternalLink from './components/ExternalLink';

import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Here are some useful categorized resources about web3, just for you :)</h1>
      <header className="App-header">
        <Table></Table>
      </header>

      <footer className="App-footer">
        <h6>
          <ExternalLink href="https://github.com/Schrubitteflau/web3-resources">
            <Button icon="pi pi-github" severity="secondary" aria-label="GitHub" />
          </ExternalLink>
        </h6>
        <p>
          Made by <ExternalLink href="https://github.com/Schrubitteflau">Schrubitteflau</ExternalLink> with <ExternalLink href="https://primereact.org/datatable/">Primereact</ExternalLink>
        </p>
      </footer>
    </div>
  );
}

export default App;
