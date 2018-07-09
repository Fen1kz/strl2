import _ from 'lodash';
import {Record, List} from 'immutable';

import {createReducer} from '../util/redux.util';

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from './input/rdx.input._';
import CONST_COMMAND from './const.commands';

import {action$playerMove} from "./rdx.game.actions";

export class Player extends Record({
  x: 0
  , y: 0
}) {
}

export class Game extends Record({
  queue: List()
  , running: false
  , player: new Player()
}) {
}

const initialState = new Game();

const COMMAND_MOVE = (x, y) => (game, data) => game.update('queue', queue => queue.push(action$playerMove(x, y)));

export default createReducer(initialState, {
  [CONST_GAME.setGameRunning]: (game, value) => game.set('running', value)
  , [CONST_INPUT.command$ + CONST_COMMAND.UP]: COMMAND_MOVE(0, -1)
  , [CONST_INPUT.command$ + CONST_COMMAND.DOWN]: COMMAND_MOVE(0, 1)
  , [CONST_INPUT.command$ + CONST_COMMAND.LEFT]: COMMAND_MOVE(-1, 0)
  , [CONST_INPUT.command$ + CONST_COMMAND.RIGHT]: COMMAND_MOVE(1, 0)
  , [CONST_GAME.playerMove]: (game, {x, y}) => game.update('player', player => player
    .update('x', x0 => x0 + x)
    .update('y', y0 => y0 + y)
  ).update('queue', queue => queue.skip(1))
});