import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from "./input/rdx.input._";
import {
  action$gameLoopStart
  , action$loadLevelComplete
  , action$gameSpawnPlayer, action$entityAbility
  , action$gameEvent
} from './rdx.game.actions';
import {selectGame, selectQueueFirst, selectPlayer, selectTile} from './rdx.game.selectors';
import {switchReducer} from "../util/redux.util";

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
    , op.switchMapTo(import('./level/level-data.sl2'))
    , op.pluck('default')
    , op.map(action$loadLevelComplete)
  )
  , (actions$, state$) => actions$.pipe(
    ofType(CONST_GAME.loadLevelComplete)
    , op.map(action$gameLoopStart)
  )
  , (actions$, state$) => Rx.merge(
    actions$.pipe(ofType(CONST_INPUT.tileClicked))
    , actions$.pipe(ofType(CONST_INPUT.entityClicked))
    , actions$.pipe(ofType(CONST_GAME.gameLoopStart))
    , actions$.pipe(ofType(CONST_GAME.gameLoopContinue))
    , actions$.pipe(ofType(CONST_GAME.gameLoopWaitPlayer))
    , actions$.pipe(ofType(CONST_GAME.gameLoopExecute))
    , actions$.pipe(ofType(CONST_GAME.playerCommand))
    , actions$.pipe(ofType(CONST_GAME.entityCommandRequestActions))
    , actions$.pipe(ofType(CONST_GAME.entityCommandGetResult))
    , actions$.pipe(ofType(CONST_GAME.entityCommandApplyEffect))
  ).pipe(
    op.mergeMap((event) => {
      const game = selectGame(state$.value);
      if (!game.rxEventHandlers.has(event.type)) {
        return Rx.NEVER;
      }
      return game.onRxEvent(event.type, state$.value, event.data);
    })
  )
];





















