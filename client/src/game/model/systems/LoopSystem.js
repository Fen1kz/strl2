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
  , action$entityCommandRequestActions
  , action$entityCommandGetResult
  , action$entityCommandApplyEffect
} from "../../rdx.game.actions";
import CommandData from "../commands/CommandData";
import {CommandResultType} from "../commands/CommandResult";

const consoleObs = (name) => ({
  next: v => console.log(name, v)
  , error: e => console.error(name, e)
  , complete: () => console.log(name, 'Completed')
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
      onEntityAttach(entity) {
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
      , [CONST_GAME.playerCommand]({command}) {
        queue$.next(command);
        return this
          .update('queue', queue => queue.push(command));
      }
      , [CONST_GAME.entityCommandGetResult]({command}) {
        if (command === this.queue.first()) {
          console.log('EQUAL');
          return this
            .update('queue', queue => queue.skip(1));
        }
        return this
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
            .map(command => command === TraitId.Player
              ? queue$.asObservable().pipe(op.first())
              : Rx.of(command))
        };

        const getEntityCommandStream$ = (entityId) => Rx.forkJoin(
          getEntityCommands(entityId)
        ).pipe(
          op.map(entityCommands => entityCommands.filter(command => !!command))
          // , op.tap(console.log.bind(null, 'getEntityCommandStream$'))
        );

        return Rx.forkJoin(
          this.actors.toArray()
            .filter(entityId => this.getEntityEnergy(entityId) >= 0)
            .map(getEntityCommandStream$)
          // .map(entityId => this.onRxEvent(CONST_GAME.entityCommandRequestActions, state, {entityId}))
        ).pipe(
          op.map(arrayOfCommands => _.flatten(arrayOfCommands))
          , op.concatMap(commands => commands)
          , op.map(command => action$entityCommandGetResult(command))
        )
      }
      , [CONST_GAME.entityCommandRequestActions](state, {entityId}) {
        const getEntityCommands = (entityId) => {
          const entity = this.getEntity(entityId);
          return entity.getActionHandlers.toArray()
            .map(handler => handler(this, entity))
            .map(command => command === TraitId.Player
              ? queue$.asObservable().pipe(op.first())
              : Rx.of(command))
        };

        const getEntityCommandStream$ = (entityId) => Rx.forkJoin(
          getEntityCommands(entityId)
        ).pipe(
          op.map(entityCommands => entityCommands.filter(command => !!command))
        );

        return getEntityCommandStream$(entityId)
          .pipe(
            op.concatMap(commands => commands)
            , op.map(command => action$entityCommandGetResult(command))
          );
        // return Rx.NEVER
      }
      , [CONST_GAME.entityCommandGetResult](state, {command}) {
        const entityId = command.sourceId;
        const commandData = CommandData[command.id];
        const commandResult = commandData.getResult(this, command);
        if (commandResult.status === CommandResultType.SUCCESS) {
          if (commandResult.energy > 0) {
            return Rx.of(
              action$entityCommandApplyEffect(command)
              , action$entityCommandRequestActions(entityId)
            );
          } else {
            return Rx.of(
              action$entityCommandApplyEffect(command)
            );
          }
        } else if (commandResult.status === CommandResultType.REPLACE) {
          return Rx.of(action$entityCommandGetResult(commandResult.replace))
        } else if (commandResult.status === CommandResultType.FAILURE) {
          return Rx.of(action$entityCommandRequestActions(entityId))
        } else {
          console.error(`Invalid commandResult`, commandResult);
          throw new Error(`Invalid commandResult ${commandResult}`);
        }
      }
      // , [CONST_GAME.gameLoopExecute](state, actions) {
      //   return Rx.concat(
      //     Rx.from(actions.map(action => action$entityCommandCheck(action)))
      //     , Rx.of(action$gameLoopContinue())
      //   );
      // }
    }
  }
}