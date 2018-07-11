import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import CONST_GAME from "./rdx.game._";
import {action$gameLoopStart
  , action$loadLevelComplete
  , action$gameSpawnPlayer
} from './rdx.game.actions';
import {selectGame, selectQueueFirst} from './rdx.game.selectors';

const fps = 1;
const timeFrameDuration = 1000 / fps;

export const updates$ = new Rx.Subject();
export const frames$ = new Rx.Subject();

const createGameLoopStream = (actions$) => {
  return Rx.interval(200).pipe(
    op.share()
    , op.takeUntil(actions$.pipe(ofType(CONST_GAME.gameLoopStop)))
  )
};

export default [
  (actions$, state$) => actions$.pipe(
    ofType(CONST_GAME.loadGameViewComplete)
    , op.switchMapTo(import('./level/level-data.sl1'), (_, iv) => iv.default)
    , op.map(action$loadLevelComplete)
  )
  ,
  (actions$, state$) => actions$.pipe(
    ofType(CONST_GAME.loadLevelComplete)
    , op.map(action$gameSpawnPlayer)
  )
  // , (actions$, state$) => actions$.pipe(
  //   ofType(CONST_GAME.gameSpawnPlayer)
  //   , op.map(action$gameLoopStart)
  // )
  ,
  (actions$, state$) => Rx.merge(
    actions$.pipe(ofType(CONST_GAME.gameLoopStart), op.mapTo(true))
    , actions$.pipe(ofType(CONST_GAME.gameLoopStop), op.mapTo(false))
  ).pipe(
    op.distinctUntilChanged()
    // , op.tap(console.log)
    , op.filter(_.identity)
    , op.switchMap(_ => createGameLoopStream(actions$))
    // , op.map(i => ({type: 'interval', data: i}))
    // , op.tap(console.log)
    , op.map(_ => selectQueueFirst(state$.value))
    , op.filter(_.identity)
  )
];