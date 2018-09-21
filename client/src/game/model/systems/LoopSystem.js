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
  , action$gameLoopExecute
  , action$entityCommandCheck
  , action$entityCommandExecute
} from "../../rdx.game.actions";
import CommandData from "../commands/CommandData";

const consoleObs = (name) => ({
  next(v) {
    console.log(name, v)
  }
  , error(e) {
    console.error(name, e)
  }
  , complete() {
    console.log(name, 'Completed')
  }
});

export function LoopSystem() {
  const queue$ = new Rx.Subject();
  // queue$.subscribe(consoleObs('queue$'));
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
        return this
          .update('queue', queue => queue.push(command));
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
      [CONST_GAME.gameLoopStart]() {
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_GAME.gameLoopContinue]() {
        const getEntityCommands = (entityId) => {
          const entity = this.getEntity(entityId);
          return entity.getActionHandlers.toArray()
            .map(handler => handler(this, entity))
            .map(command => {
              if (command !== true) {
                return command;
              } else {
                if (!this.queue.isEmpty()) {
                  return this.queue.first();
                } else {
                  return queue$.asObservable().pipe(op.tap(console.log), op.first())
                }
              }
            })
        };

        const getEntityCommandStream$ = (entityId) => Rx.forkJoin(
          getEntityCommands(entityId)
            // .map(a => (console.log(a), a))
            .map(a => Rx.isObservable(a) ? a : Rx.of(a))
            .map(o => o.pipe(op.tap((...args) => console.log('operation', ...args))))
            .map(a => (console.log(a), a))
        ).pipe(op.map(entityCommands => entityCommands.filter(command => !!command)));

        return Rx.forkJoin(
          this.actors.toArray()
            .filter(entityId => this.getEntityEnergy(entityId) >= 0)
            .map(getEntityCommandStream$)
        )
          .pipe(
            op.tap((...args) => console.log('FINALLY', ...args))
            , op.switchMap(commands => Rx.from(commands))
            , op.tap((...args) => console.log('commands', ...args))
          )
        //   .subscribe(consoleObs('fk'));
        // return Rx.NEVER
      }
      , [CONST_GAME.playerCommand](state, {command}) {
        queue$.next(command);
        // if (this.waitingPlayer) {
        //   return Rx.of(action$gameLoopExecute(this.waitingActions.push(command).toArray()));
        // }
        return Rx.NEVER;
      }
      , [CONST_GAME.gameLoopExecute](state, actions) {
        return Rx.concat(
          Rx.from(actions.map(action => action$entityCommandCheck(action)))
          , Rx.of(action$gameLoopContinue())
        );
      }
      , [CONST_GAME.entityCommandCheck](state, {command}) {
        const commandData = CommandData[command.id];
        const commandResult = commandData.effect(this, command);
        if (commandResult !== false) {
          return Rx.of(action$entityCommandExecute(command));
        }
        return Rx.NEVER;
      }
    }
  }
}