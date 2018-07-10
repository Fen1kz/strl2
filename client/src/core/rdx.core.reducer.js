import { combineReducers } from 'redux-immutable';
import { filterActions } from 'redux-ignore';

import chunks from '../chunk-editor/reducer';
import game from '../game/rdx.game.reducer';
import input from '../game/input/rdx.input.reducer';

export default filterActions(
  combineReducers({
    chunks
    , game
    , input
  })
, action => action.valid !== false)