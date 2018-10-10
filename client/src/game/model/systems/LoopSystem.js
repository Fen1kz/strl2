import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";

import CONST_GAME from '../../rdx.game._';
import CONST_INPUT from '../../input/rdx.input._';
import TraitId from "../traits/TraitId";
import {updateViaReduce} from "../Model.utils";
import {selectGame} from "../../rdx.game.selectors";
import {
  action$gameLoopContinue
  , action$gameLoopEnergy
  , action$entityCommandRequestActions
  , action$entityCommandGetResult
  , action$entityCommandScheduleEffect
  , action$entityCommandApplyEffects, action$playerCommand
} from "../../rdx.game.actions";
import CommandData, {CommandTargetType} from "../commands/CommandData";
import {CommandResultType} from "../commands/CommandResult";
import CommandResult from "../commands/CommandResult";
import {getCommandResult} from "../commands/Command.utils";
import {ofType} from "redux-observable";
import CommandId from "../commands/CommandId";

const consoleObs = (name) => ({
  next: v => console.log(name, v)
  , error: e => console.error(name, e)
  , complete: () => console.log(name, 'Completed')
});

export function LoopSystem() {
  const TIME_TURN = 500;
  const TIME_DEBOUNCE = 1000;
  const queue$ = new Rx.Subject();
  let waitingForInput = false;
  // queue$.subscribe(consoleObs('queue$'));

  return {
    running: false
    , scheduledEffects: List()
    , queue: List()
    , animate: false
    , actors: Map()
    , getEntityEnergy(entityId) {
      return this.actors.get(entityId);
    }
    , updateEntityEnergy(entityId, cb) {
      return this.updateIn(['actors', entityId], cb);
    }
    , events: {
      onEntityAttach(entity) {
        if (entity.hasTrait(TraitId.Energy)) {
          return this.setIn(['actors', entity.id], 0);
        }
        return this;
      }
      , onEntityDetach(entity) {
        if (entity.hasTrait(TraitId.Energy)) {
          return this.removeIn(['actors', entity.id]);
        }
        return this;
      }
      , [CONST_INPUT.inputPlayer]({inputCommand, interval}) {
        console.log('event', waitingForInput, interval < TIME_DEBOUNCE, inputCommand);
        if (!waitingForInput) {
          if (interval < TIME_DEBOUNCE) {
            return this.update('queue', queue => queue.push(inputCommand));
          } else {
            return this.set('queue', List.of(inputCommand));
          }
        }
        return this;
      }
      , [CONST_GAME.playerCommand]({command, interval}) {
        console.log('playedCommand', waitingForInput, this.queue.size);
        return this.update('queue', queue => queue.shift());
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart]() {
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_INPUT.inputPlayer](actions$, state$, {inputCommand}) {
        console.log('rxEvent: inputPlayer');
        // console.log(waitingForInput, interval < TIME_DEBOUNCE, inputCommand);
        if (waitingForInput) {
          waitingForInput = false;
          return Rx.of(action$playerCommand(inputCommand))
        }
        return Rx.NEVER;
      }
      , [CONST_GAME.gameLoopContinue](actions$) {
        const actorsArrayOfCommands = this.actors.keySeq().toArray()
          .filter(entityId => this.getEntityEnergy(entityId) >= 0)
          .map(entityId => entityCommandRequestActions(this, entityId, actions$));

        if (actorsArrayOfCommands.length === 0) {
          return Rx.concat(
            Rx.of(action$gameLoopEnergy())
            , Rx.of(action$gameLoopContinue())
          )
        } else {
          return Rx.concat(
            Rx.forkJoin(actorsArrayOfCommands)
              .pipe(
                op.concatAll() // [[C, C], [C, C], [C, C]] => [C, C] - [C, C] - [C, C]
                , op.concatAll() // [C, C] - [C, C] - [C, C] => C - C - C - C - C - C
                , op.concatMap(command => entityCommandGetResult(this, command)
                )
              )
            , Rx.of(action$gameLoopContinue()).pipe(op.delay(TIME_TURN))
          )
        }
      }
    }
  };

  /*
   * Helpers
   */

  function entityCommandRequestActions(game, entityId, actions$) {
    const entity = game.getEntity(entityId);
    console.log('entityCommandRequestActions');
    const entityCommandArray = entity.getCommandsArray()
      .map(handler => handler(game, entity))
      .filter(command => !!command)
      .map(command => {
        if (command === TraitId.Player) {
          console.log('game.queue', game.queue.size);
          if (!game.queue.isEmpty()) {
            const requestedItem = game.queue.first();
            return Rx.of(action$playerCommand(
              CommandData[CommandId.MOVE].getCommand(this.playerId, 10, 10)
            ))
          }
          waitingForInput = true;
          return actions$.pipe(
            ofType(CONST_GAME.playerCommand)
            , op.take(1)
            , op.pluck('data', 'command')
          );
        } else {
          return Rx.of(command);
        }
      });

    return (entityCommandArray.length === 0
      ? Rx.of([])
      : Rx.forkJoin(entityCommandArray))
  }

  function entityCommandGetResult(game, command) {
    const entityId = command.sourceId;
    const commandResult = getCommandResult(game, command);
    switch(commandResult.status) {
      case CommandResultType.SUCCESS:
        return Rx.of(action$entityCommandScheduleEffect(command));
      case CommandResultType.REPLACE:
      case CommandResultType.REPLACE_FORCED:
        return entityCommandGetResult(game, commandResult.command);
      case CommandResultType.FAILURE:
        return entityCommandRequestActions(game, entityId)
          .pipe(
            op.concatAll()
            , op.map(command => entityCommandGetResult(game, command, queue$))
            , op.concatMap(a => Rx.isObservable(a) ? a : Rx.of(a))
          );
      default:
        console.error(`Invalid commandResult`, commandResult);
        throw new Error(`Invalid commandResult ${commandResult}`);
    }
  }
}