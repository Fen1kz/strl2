import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

// import {gameLoop} from './input.actions';

const fps = 1;
const timeFrameDuration = 1000 / fps;

export const updates$ = new Rx.Subject();
export const frames$ = new Rx.Subject();

const createGameLoopStream = () => {
  let timePrev = window.performance.now();
  let timeTotal = 0;

  return Rx.of(0, Rx.animationFrameScheduler).pipe(
    op.repeat()
    , op.map(() => {
      const timeNow = window.performance.now();
      let timeDelta = timeNow - timePrev;
      timePrev = timeNow;

      if (timeDelta > 1000) {
        timeDelta = timeFrameDuration;
      }
      timeTotal += timeDelta;

      while (timeTotal >= timeFrameDuration) {
        updates$.next(timeFrameDuration);
        timeTotal -= timeFrameDuration;
      }

      frames$.next(timeTotal / timeFrameDuration);
    })
  );
};

export default [
  (actions$, state$) => Rx.merge(
    actions$.pipe(ofType('gameLoopStart'), op.mapTo(true))
    , actions$.pipe(ofType('gameLoopStop'), op.mapTo(false))
  ).pipe(
    op.distinctUntilChanged()
    , op.filter(_.identity)
    , op.flatMap(() => {
      return createGameLoopStream()
        .pipe(
          op.takeUntil(actions$.pipe(ofType('gameLoopStop')))
        )
    })
    , op.flatMap(() => Rx.NEVER)
  )
];