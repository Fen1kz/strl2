import React, {PureComponent} from 'react';
import ChunkList from './ChunkList';
import ChunkEdit from './ChunkEdit';
import {Switch, Route, Link, withRouter} from "react-router-dom";

import './chunk-editor.css';

export class ChunkEditorPage extends PureComponent {
  render() {
    return (<div>
      <button onClick={() => this.setState({on: true})}>on</button>
      <button onClick={() => this.setState({on: false})}>off</button>
      <div>
        <Switch>
          <Route exact path="/chunk" component={ChunkList} />
          <Route exact path="/chunk/:id" component={ChunkEdit} />
        </Switch>
      </div>
    </div>);
  }
}

export default ChunkEditorPage;
