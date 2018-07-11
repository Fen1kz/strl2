import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import {makeCommand} from './rdx.input.actions';

import {Key} from '../../util/Keyboard';
import Commands from '../const.commands';

const key2command = {
  [Key.W]: Commands.UP
  , [Key.A]: Commands.LEFT
  , [Key.S]: Commands.DOWN
  , [Key.D]: Commands.RIGHT
};

export default [
  // (actions$, state$) => actions$.pipe(ofType('keyDown')
  (actions$, state$) => Rx.fromEvent(document, 'keydown').pipe(
    op.map(e => e.which || e.keyCode || 0)
    , op.map(keyCode => key2command[keyCode])
    , op.filter(_.identity)
    , op.map(makeCommand)
  )
];