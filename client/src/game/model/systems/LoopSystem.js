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
    , getEntityEnergy(entityId) {
      return this.getEntity(entityId).traits.get(TraitId.Energy);
    }
    , events: {
      [CONST_GAME.entityCommand]({command}) {
        console.log('Command', command);
        return this.update('queue', queue => queue.push(command));
      }
      , onEntityAttach(entity) {
        if (entity.hasTrait(TraitId.Energy)) {
          return this
            .update('actors', actors => actors.push(entity.id))
        }
        return this;
      }
      , [CONST_GAME.gameLoopStart]() {
        console.log('event gameLoopStart');
        return this.set('running', true);
      }
      , [CONST_GAME.gameLoopContinue]() {
        return this.update(updateViaReduce(this.actors, (...args) => {
          console.log(...args)
          const [game, actorId] = args;
          return game.updateEntity(actorId, (actor) => {
            return actor.updateIn(['traits', TraitId.Energy], energy => energy + 5);
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
        const actions = game.actors.map(entityId => {
          if (game.getEntityEnergy(entityId) <= 0) return [];
          const entity = game.getEntity(entityId);
          const entityActions = entity
            .getActionHandlers
            .map(handler => handler(game, entity))
            .filter(a => !!a)
            .toArray();
          return entityActions;

          // return Rx.of(entity
          //   .getActionHandlers
          //   .map(handler => handler(game, entity))
          //   .filter(a => !!a)
          // )
        })
          .filter(actionArray => actionArray.length !== 0)
          .toArray();
        console.log(actions);
        if (actions.length === 0) {
          return Rx.of(action$gameLoopContinue())
            .pipe(op.delay(1000));
        } else {
          return Rx.NEVER;
        }
      }
    }
  }
}