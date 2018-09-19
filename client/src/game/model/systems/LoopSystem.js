import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";

import CONST_GAME from '../../rdx.game._';
import TraitId from "../traits/TraitId";
import {updateViaReduce} from "../Model.utils";
import {selectGame} from "../../rdx.game.selectors";
import {
  action$gameLoopContinue
  , action$gameLoopWaitPlayer
  , action$gameLoopExecute, action$entityCommand
} from "../../rdx.game.actions";

export function LoopSystem() {
  return {
    running: false
    , waitingPlayer: false
    , waitingActions: List()
    , queue: List()
    , actors: List()
    , getEntityEnergy(entityId) {
      return this.getEntity(entityId).traits.get(TraitId.Energy);
    }
    , events: {
      [CONST_GAME.playerCommand]({command}) {
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
        return this.set('running', true);
      }
      , [CONST_GAME.gameLoopContinue]() {
        return this.update(updateViaReduce(this.actors, (game, actorId) => {
          return game.updateEntity(actorId, (actor) => {
            return actor.updateIn(['traits', TraitId.Energy], energy => energy + 5);
          })
        }));
      }
      , [CONST_GAME.gameLoopWaitPlayer](actions) {
        return this
          .set('waitingPlayer', true)
          .set('waitingActions', List(actions));
      }
      , [CONST_GAME.gameLoopExecute](actions) {
        return this
          .set('waitingPlayer', false)
          .set('waitingActions', List())
          .update('queue', queue => queue.skip(1));
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart](state) {
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_GAME.gameLoopContinue](state) {
        let actions = this.actors.map(entityId => {
          if (this.getEntityEnergy(entityId) <= 0) return [];
          const entity = this.getEntity(entityId);
          return entity
            .getActionHandlers
            .map(handler => handler(this, entity))
            .filter(a => !!a)
            .toArray();
        })
          .filter(actionArray => actionArray.length !== 0)
          .toArray();
        if (actions.length === 0) {
          return Rx.of(action$gameLoopContinue());
        } else {
          actions = actions.reduce((res, next) => res.concat(next));
          const playerInputNeeded = _.remove(actions, action => action === true).length > 0;
          if (playerInputNeeded) {
            if (this.queue.isEmpty()) {
              return Rx.of(action$gameLoopWaitPlayer(actions));
            } else {
              actions.push(this.queue.first());
            }
          }
          return Rx.of(action$gameLoopExecute(actions));
        }
      }
      // , [CONST_GAME.gameLoopWaitPlayer](state) {
      //   return Rx.NEVER;
      // }
      , [CONST_GAME.playerCommand](state, {command}) {
        if (this.waitingPlayer) {
          return Rx.of(action$gameLoopExecute(this.waitingActions.push(command).toArray()));
        } else {
          return Rx.NEVER;
        }
      }
      , [CONST_GAME.gameLoopExecute](state, actions) {
        return Rx.concat(
          Rx.from(actions.map(action => action$entityCommand(action)))
          , Rx.of(action$gameLoopContinue())
        );
      }
    }
  }
}