import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import CONST_GAME from "./rdx.game._";
import {action$setGameRunning} from './rdx.game.actions';
import {selectQueueFirst} from './rdx.game.selectors';

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
  (actions$, state$) => Rx.merge(
    actions$.pipe(ofType(CONST_GAME.gameLoopStart), op.mapTo(true))
    , actions$.pipe(ofType(CONST_GAME.gameLoopStop), op.mapTo(false))
  ).pipe(
    op.distinctUntilChanged()
    , op.mergeMap(value => {
      const update$ = Rx.of(value).pipe(
        op.filter(_.identity)
        , op.switchMap(_ => createGameLoopStream(actions$))
        , op.map(v => selectQueueFirst(state$.value))
        , op.filter(_.identity)
        // , op.tap(v => console.log('update', v))
      );

      return Rx.merge(
        update$
        , Rx.of(action$setGameRunning(value))
      );
    })
  )
];

// export default [
//   (actions$, state$) => Rx.merge(
//     actions$.pipe(ofType(CONST_GAME.gameLoopStart), op.mapTo(true))
//     , actions$.pipe(ofType(CONST_GAME.gameLoopStop), op.mapTo(false))
//   ).pipe(
//     op.distinctUntilChanged()
//     , op.mergeMap(action => Rx.of(action).pipe(
//       op.filter(_.identity)
//       , op.switchMap(_ => createGameLoopStream(actions$))
//       , op.flatMap(() => {
//         return Rx.NEVER;
//       })
//     ))
//     , op.filter(_.identity)
//     , op.switchMap(_ => createGameLoopStream(actions$))
//     , op.flatMap(() => {
//       return Rx.NEVER;
//     })
//   )
// ];