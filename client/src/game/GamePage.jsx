import React from 'react';
import {Switch, Route, Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";

import {keyDown, keyUp} from "./input/rdx.input.actions";

import {GlobalKeyboard as Keyboard, Key} from "../util/Keyboard";
import Game from './Game';

export class GamePage extends React.Component {
  render() {
    console.log('render', this.props);
    return (<div>
      <Game/>
      <Keyboard onKeyDown={e => this.props.keyDown(e.keyCode)}
                onKeyUp={e => this.props.keyUp(e.keyCode)}/>
      <pre></pre>
    </div>);
  }
}

export default connect(
  null
  , {keyDown, keyUp}
)(GamePage);
