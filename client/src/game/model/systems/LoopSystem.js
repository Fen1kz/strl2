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
  ,  action$gameLoopApply
  ,  action$gameLoopEnergy
  ,  action$entityCommandRequestActions
  ,  action$entityCommandGetResult
  ,  action$entityCommandApplyEffects,
  action$entityCommand,
  action$playerModeChange,
  action$entityCommandApplyEffect,
  action$playerQueueShift, action$playerQueueClear
} from "../../rdx.game.actions";
import CommandData, {CommandTargetType} from "../commands/CommandData";
import {CommandResultType} from "../commands/CommandResult";
import CommandResult from "../commands/CommandResult";
import {applyCommandEffect, CommandResolver, getCommandResult, resolveEntityCommand} from "../commands/Command.utils";
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
      , [CONST_GAME.playerQueueShift]() {
        console.log('playerQueueShift', waitingForInput, this.queue.size);
        return this.update('queue', queue => queue.shift());
      }
      , [CONST_GAME.playerQueueClear]() {
        console.log('playerQueueClear', waitingForInput, this.queue.size);
        return this.set('queue', List());
      }
      , [CONST_GAME.entityCommandApplyEffect]({command}) {
        console.log(action$entityCommandApplyEffect)
        return applyCommandEffect(this, command)
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart]() {
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_GAME.gameLoopContinue](actions$) {
        // const commandsPerEntityPerActors = [[cmd$, cmd$], [cmd$, cmd$], [cmd$, cmd$]]
        const commandsPerEntityPerActors = this.actors.keySeq()
          .filter(entityId => this.getEntityEnergy(entityId) >= 0)
          .map(entityId => getCommandsPerEntity(this, entityId, actions$))
          .filter(commands => commands.length > 0)
          .toArray();

        if (commandsPerEntityPerActors.length === 0) {
          // No active entities
          return Rx.concat(
            Rx.of(action$gameLoopEnergy())
            , Rx.of(action$gameLoopContinue())
          )
        } else {
          return Rx.concat(
            Rx.from(commandsPerEntityPerActors).pipe(
              op.concatAll() // [cmd$, cmd$] - [cmd$, cmd$] => cmd$ - cmd$ - cmd$
              , op.concatAll() // cmd$ - cmd$ - cmd$ => cmd - cmd - cmd
              // , op.concatMap(command => entityCommandGetResult(this, command))
              // , op.tap(console.log)
            )
            , Rx.of(action$gameLoopContinue()).pipe(op.delay(TIME_TURN))
          )
        }
      }
      , [CONST_INPUT.inputPlayer](actions$, state$, {inputCommand}) {
        console.log('rxEvent: inputPlayer');
        // console.log(waitingForInput, interval < TIME_DEBOUNCE, inputCommand);
        if (waitingForInput) {
          waitingForInput = false;
          queue$.next(inputCommand);
        }
        return Rx.NEVER;
      }
      , [CONST_GAME.entityCommand](actions$, state$, command) {
        const resolver = new CommandResolver(this);
        return CommandData[command.id].resolveCommand(resolver, command);
      }
    }
  };

  /*
   * Helpers
   */

  function getCommandsPerEntity(game, entityId, actions$) {
    const entity = game.getEntity(entityId);
    // return [command$, command$, command$];
    return entity.requestCommandFromTraits(game)
      .filter(command => !!command)
      .map(command => getCommand(game, command));
  }

  function getCommand(game, command) {
    if (command !== TraitId.Player) {
      return Rx.of(action$entityCommand(command));
    } else {
      console.log('game.queue', game.queue.size);
      if (!game.queue.isEmpty()) {
        return Rx.concat(
          Rx.of(action$playerQueueShift())
          , processInputCommand(game, game.queue.first())
        );
      } else {
        waitingForInput = true;
        return queue$.pipe(
          op.take(1)
          , op.concatMap(ic => processInputCommand(game, ic))
        );
      }
    }
  }

  function processInputCommand(game, inputCommand) {
    switch (inputCommand.type) {
      case CONST_INPUT.InputCommand_PLAYER_MODE_CHANGE:
        const {playerModeType, commandId} = inputCommand;
        return Rx.of(action$playerModeChange(playerModeType, commandId));
      case CONST_INPUT.InputCommand_MOVE:
        const {offset} = inputCommand;
        return game.playerMode.onCursorMove(game, offset);
      default:
        console.error(inputCommand);
        throw new Error(`invalid inputCommand`);
    }
  }

  function entityCommandGetResult(game, command) {
    const entityId = command.sourceId;
    const isPlayer = game.playerId === entityId;
    const commandResult = getCommandResult(game, command);
    switch (commandResult.status) {
      case CommandResultType.SUCCESS:
        return Rx.of(action$entityCommandApplyEffect(command));
      case CommandResultType.REPLACE:
      case CommandResultType.REPLACE_FORCED:
        return entityCommandGetResult(game, commandResult.command);
      case CommandResultType.FAILURE:
        return !isPlayer ? Rx.EMPTY : Rx.of(action$playerQueueClear());
      default:
        console.error(`Invalid commandResult`, commandResult);
        throw new Error(`Invalid commandResult ${commandResult}`);
    }
  }
}