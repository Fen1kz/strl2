import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ChunkEditorPage from './chunk-editor/ChunkEditorPage';
import ChunkService from './chunk-editor/ChunkService';

class App extends Component {
  constructor () {
    super();
    this.services = [new ChunkService()];
  }
  
  render() {
    return (
      <div className="App">
        <ChunkEditorPage/>
      </div>
    );
  }
}

export default App;
