import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import CONST_GAME from "./rdx.game._";
import {action$gameLoopStart} from './rdx.game.actions';
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

const validActionFilter = action => action.valid === void 0;
const validActionSet = cb => action => action.valid = !!cb();

const isGameStateValid = (state$) => selectGame(state$.value).isValid();

export default [
  (actions$, state$) => actions$.pipe(
    ofType(CONST_GAME.gameLoopStart)
    , op.filter(validActionFilter)
    , op.tap(validActionSet(() => isGameStateValid(state$)))
    , op.skip()
  )
  , (actions$, state$) => Rx.merge(
    actions$.pipe(ofType(CONST_GAME.gameLoopStart)
      , op.tap(console.log)
      , op.map(a => a.valid))
    , actions$.pipe(ofType(CONST_GAME.gameLoopStop), op.mapTo(false))
  ).pipe(
    op.distinctUntilChanged()
    // , op.tap(console.log)
    , op.filter(_.identity)
    , op.switchMap(_ => createGameLoopStream(actions$))
    // , op.map(i => ({type: 'interval', payload: i}))
    // , op.tap(console.log)
    , op.map(_ => selectQueueFirst(state$.value))
    , op.filter(_.identity)
  )
];