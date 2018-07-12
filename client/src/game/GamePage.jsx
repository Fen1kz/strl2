import React from 'react';
import {Switch, Route, Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";

import {GlobalKeyboard as Keyboard, Key} from "../util/Keyboard";
import Game from './Game';

export class GamePage extends React.Component {
  render() {
    console.log('render', this.props);
    return (<div>
      <Game/>
      <pre></pre>
    </div>);
  }
}

export default connect(
  null
  , null
)(GamePage);
