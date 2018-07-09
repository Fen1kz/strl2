import { combineReducers } from 'redux-immutable';

import chunks from '../chunk-editor/reducer';
import game from '../game/rdx.game.reducer';
import input from '../game/input/rdx.input.reducer';

export default combineReducers({
  chunks
  , game
  , input
})