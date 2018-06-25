import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import ChunkEditorPage from './chunk-editor/ChunkEditorPage';

class App extends Component {
  constructor () {
    super();
  }

  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <div>
              <Link to="/">Home</Link>
              <Link to="/chunk">Chunk</Link>
            </div>
            <div>
              <Route path="/chunk" component={ChunkEditorPage} />
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;

