import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ChunkEditorPage from './chunk-editor/ChunkEditorPage';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ChunkEditorPage/>
      </div>
    );
  }
}

export default App;
