import React, {PureComponent} from 'react';
import ChunkEditor from './ChunkEditor';
import {ChunkServiceCtx} from './ChunkService';

export default class ChunkEditorPage extends PureComponent {
  constructor() {
    super();
    this.state = {on: true};
  }
  
  render() {
    return (<div>
      <button onClick={() => this.setState({on: true})}>on</button>
      <button onClick={() => this.setState({on: false})}>off</button>
        <div>
          {this.state.on && <ChunkEditor/>}
          <ChunkEditor visible={this.state.on}/>
        </div>
      </div>)
  }
}