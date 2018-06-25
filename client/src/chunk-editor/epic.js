import { pipe } from 'rxjs';
import {ajax} from "rxjs/ajax";
import {exhaustMap, map, filter} from "rxjs/operators";
import {ofType} from "redux-observable";

import {selectChunks} from './selectors';

import {getChunkListSuccess, getChunkSuccess} from "./actions";

export default [
  (actions$, state$) => actions$.pipe(
    ofType('getChunkList')
    // , filter(() => selectChunks(state$.value) === null)
    , exhaustMap(action =>
        ajax.getJSON(`http://localhost:8080/api/chunks`).pipe(
          map(getChunkListSuccess)
        )
      // .map()
      // .takeUntil(actions$.ofType('fetchChunks'))
      // .retry(2)
      // .catch(error => Observable.of(fetchUserFailed()))
    )
  )
  , (actions$, state$) => actions$.pipe(
    ofType('getChunk')
    // , filter(() => selectChunks(state$.value) === null)
    , exhaustMap(action =>
      ajax.getJSON(`http://localhost:8080/api/chunks/${action.payload}`).pipe(
        map(getChunkSuccess)
      )
      // .map()
      // .takeUntil(actions$.ofType('fetchChunks'))
      // .retry(2)
      // .catch(error => Observable.of(fetchUserFailed()))
    )
  )
];