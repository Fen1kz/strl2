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
} from './rdx.game.actions';
import {selectGame, selectQueueFirst, selectPlayer, selectTile} from './rdx.game.selectors';
import {switchReducer} from "../util/redux.util";
import {ABILITY, ABILITY_ID, STAT, ABILITY_TARGET_TYPE} from "./model/EntityModel";

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
      const player = game.getPlayer();

      const tile = game.getTile(tileId);

      if (tile.isNext(player.tileId)) {
        const elist = tile.getEntityList(game);

        let abils = elist.reduce((entityActionList, entity) => {
            return entityActionList.concat(
              entity.getAbilities(game, player, entity).map(abil => [abil, entity.id])
            );
          }, player.getAbilities(game, player, tile).map(abil => [abil, tile.id])
        );

        if (abils[0]) {
          const [abil, targetId] = abils[0];

          return Rx.of(action$entityAbility(
            abil.id
            , player.id
            , targetId
          ))
        }
      }

      return Rx.NEVER;
    })
  )
];





















