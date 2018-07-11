import _ from 'lodash';
import {Record, List} from 'immutable';

import {createReducer} from '../util/redux.util';

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from './input/rdx.input._';
import CONST_COMMAND from './const.commands';

import {action$playerMove} from "./rdx.game.actions";
import GameModel from './model/GameModel.js'
import PlayerModel from './model/PlayerModel.js'

const initialState = new GameModel();

const COMMAND_MOVE = (x, y) => (game, data) => game
  .update('queue', queue => queue.push(action$playerMove(x, y)));

export default createReducer(initialState, {
  [CONST_GAME.gameLoopStart]: (game) => game.set('running', true)
  , [CONST_GAME.gameLoopStop]: (game) => game.set('running', false)
  , [CONST_GAME.playerMove]: (game, {x, y}) => game.update('player', player => player
    .update('x', x0 => x0 + x)
    .update('y', y0 => y0 + y)
  ).update('queue', queue => queue.skip(1))
  , [CONST_GAME.loadLevelComplete]: (game, data) => game.parseLevel(data)
  , [CONST_GAME.gameSpawnPlayer]: (game, data) => {
    const start = game.level.find(tile => tile.text === '@').pos;
    const player = new PlayerModel().update('pos', pos => pos.setTo(start));
    return game
      .set('player', player)
      .updateIn(['camera', 'pos'], pos => pos.setTo(start))
    ;
  }
  , [CONST_INPUT.command$ + CONST_COMMAND.UP]: COMMAND_MOVE(0, -1)
  , [CONST_INPUT.command$ + CONST_COMMAND.DOWN]: COMMAND_MOVE(0, 1)
  , [CONST_INPUT.command$ + CONST_COMMAND.LEFT]: COMMAND_MOVE(-1, 0)
  , [CONST_INPUT.command$ + CONST_COMMAND.RIGHT]: COMMAND_MOVE(1, 0)
});

// intent > validate > command > queue > execute