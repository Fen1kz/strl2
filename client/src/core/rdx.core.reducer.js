import {combineReducers} from 'redux-immutable';

import chunks from '../chunk-editor/reducer';
import game from '../game/rdx.game.reducer';

export default combineReducers({
  chunks
  , game
});