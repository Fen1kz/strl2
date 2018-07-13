import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from "./input/rdx.input._";
import {
  action$gameLoopStart
  , action$loadLevelComplete
  , action$gameSpawnPlayer, action$entityAction
} from './rdx.game.actions';
import {selectGame, selectQueueFirst, selectPlayer, selectTile} from './rdx.game.selectors';
import {switchReducer} from "../util/redux.util";
import {ENTITY_ACTION, ENTITY_STAT} from "./model/EntityModel";

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
    , op.switchMapTo(import('./level/level-data.sl1'))
    , op.pluck('default')
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
  , (actions$, state$) => Rx.merge(
    actions$.pipe(ofType(CONST_INPUT.tileClicked))
    , actions$.pipe(ofType(CONST_INPUT.entityClicked))
  ).pipe(
    op.pluck('data')
    , op.switchMap(({tileId, entityId}) => {
      const game = selectGame(state$.value);
      const player = selectPlayer(state$.value);

      const tile = selectTile(state$.value, tileId);

      if (tile.isNext(player.tileId)) {

        const elist = entityId
          ? [game.emap.get('' + entityId)]
          : tile.elist.map(eid => game.emap.get('' + eid));

        let actions = elist.reduce((entityActionList, entity) => {
          return entityActionList.concat(entity.traits.reduce((traitActionList, trait) => {
            return traitActionList.concat(trait.actions.keySeq().toArray());
          }, []))
        }, [ENTITY_ACTION.MOVE]);
        actions = actions
          .filter(actionName => elist
            .every(entity => entity.onValidate(actionName)));
        if (actions.length > 1) {
          console.log('MULTIPLE ACTIONS:', actions);
        }
        if (actions[0]) {
          return Rx.of(action$entityAction(actions[0], null, tileId))
        }
      }

      return Rx.NEVER;
    })
  )
];





















