import 'rxjs';
import { combineEpics } from 'redux-observable';

import chunkEditorEpics from './chunk-editor/epic';

export default combineEpics(
  ...chunkEditorEpics
);