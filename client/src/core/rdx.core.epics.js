import {combineEpics} from 'redux-observable';

import chunkEditorEpics from '../chunk-editor/epic';
import inputEpics from '../game/input/rdx.input.epic';
import gameEpics from '../game/rdx.game.epic';

export default combineEpics(
  ...[].concat(
    inputEpics
    , gameEpics
  ));