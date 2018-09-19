import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";

import CONST_GAME from '../../rdx.game._';
import TraitId from "../traits/TraitId";
import {updateViaReduce} from "../Model.utils";
import {selectGame} from "../../rdx.game.selectors";
import {action$gameLoopContinue} from "../../rdx.game.actions";

export function LoopSystem() {
  return {
    running: false
    , queue: List()
    , actors: List()
    , events: {
      [CONST_GAME.entityCommand]({command}) {
        console.log('Command', command);
        return this.update('queue', queue => queue.push(command));
      }
      , onEntityAttach(entity) {
        if (entity.hasTrait(TraitId.Energy)) {
          const requestAction$ = new Rx.Subject();
          const action$ = requestAction$
            .asObservable();
          // .map(({game, entity}) => {
          //   entity.getActions()
          // });

          return this
            .update('actors', actors => actors.push(entity.id))
            .updateEntity(entity.id, entity => entity
              .set('action$', action$)
              .set('requestAction$', requestAction$)
            );
        }
        return this;
      }
      , [CONST_GAME.gameLoopStart]() {
        console.log('event gameLoopStart');
        return this.set('running', true);
      }
      , [CONST_GAME.gameLoopContinue]() {
        return this.update(updateViaReduce(list, (game, actorId) => {
          return game.updateEntity(actorId, actor => {
            return actor.update(TraitId.Energy, energy => energy + 5);
          })
        }));
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart](state) {
        console.log('rxEvent gameLoopStart');
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_GAME.gameLoopContinue](state) {
        const game = selectGame(state);
        if (!game.running) return Rx.NEVER;
        return Rx.forkJoin(
          ...[game.actors.map(entityId => {
            const entity = game.getEntity(entityId);
            return Rx.of(entity
              .getActionHandlers
              .map(handler => handler(game, entity))
              .filter(a => !!a)
            )
          })]
        ).zip()
      }
    }
  }
}