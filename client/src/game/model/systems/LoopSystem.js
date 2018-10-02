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
  , action$gameLoopEnergy
  , action$entityCommandRequestActions
  , action$entityCommandGetResult
  , action$entityCommandScheduleEffect
  , action$entityCommandApplyEffects
} from "../../rdx.game.actions";
import CommandData, {CommandTargetType} from "../commands/CommandData";
import {CommandResultType} from "../commands/CommandResult";
import CommandResult from "../commands/CommandResult";

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
    , scheduledEffects: List()
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
      , [CONST_GAME.playerCommand]({command}) {
        queue$.next(command);
        return this
        // .update('queue', queue => queue.push(command));
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart]() {
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_GAME.gameLoopContinue]() {
        const actorsArrayOfCommands = this.actors.toArray()
          .filter(entityId => this.getEntityEnergy(entityId) >= 0)
          .map(entityId => entityCommandRequestActions(this, entityId, queue$));

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
                , op.concatMap(command => entityCommandGetResult(this, command, queue$)
                )
              )
            , Rx.of(action$gameLoopContinue())
          )
        }
      }
    }
  }
}

function entityCommandRequestActions(game, entityId, queue$) {
  const entity = game.getEntity(entityId);
  const entityCommandArray = entity.getCommandsArray()
    .map(handler => handler(game, entity))
    .filter(command => !!command)
    .map(command => command === TraitId.Player
      ? queue$.asObservable().pipe(op.first())
      : Rx.of(command));

  return (entityCommandArray.length === 0
    ? Rx.of([])
    : Rx.forkJoin(entityCommandArray))
}

function getCommandResultByEntity(game, command, entityId) {
  const commandData = CommandData[command.id];
  let resultSuccess = commandData.resultDefault.status === CommandResultType.SUCCESS;
  let resultReplace = null;
  game.getEntity(entityId).traits
    .some((traitValue, traitId) => {
      const resultByTraitFn = commandData.resultByTrait[traitId];
      if (resultByTraitFn) {
        const result = resultByTraitFn(game, command, traitValue, command.sourceId, entityId);
        if (result.status === CommandResultType.FAILURE) {
          resultSuccess = false;
        } else if (result.status === CommandResultType.REPLACE) {
          resultReplace = result;
        }
        return (!resultSuccess && resultReplace);
      }
    });
  if (resultSuccess) {
    return CommandResult.getSuccess();
  } else {
    if (resultReplace) {
      return resultReplace;
    } else {
      return CommandResult.getFailure()
    }
  }
}

function getCommandResultByTile(game, command) {
  const tileId = command.targetId;
  let resultSuccess = true;
  let resultReplace = null;
  game.getTile(tileId).elist.some(entityId => {
    const result = getCommandResultByEntity(game, command, entityId);
    if (result.status === CommandResultType.FAILURE) {
      resultSuccess = false;
    } else if (result.status === CommandResultType.REPLACE) {
      resultSuccess = false;
      resultReplace = result;
    }
    return (!resultSuccess && resultReplace);
  });
  if (resultSuccess) {
    return CommandResult.getSuccess();
  } else {
    if (resultReplace) {
      return resultReplace;
    } else {
      return CommandResult.getFailure()
    }
  }
}

function getCommandResult(game, command) {
  const commandData = CommandData[command.id];
  if (commandData.targetType === CommandTargetType.TILE) {
    return getCommandResultByTile(game, command)
  } else if (commandData.targetType === CommandTargetType.ENTITY) {
    return getCommandResultByEntity(game, command, command.targetId)
  } else if (commandData.targetType === CommandTargetType.SELF) {
    return CommandResult.getSuccess();
  }  else if (commandData.targetType === CommandTargetType.COMBINED) {
    return CommandResult.getSuccess();
  } else {
    throw new Error(`Unknown commandData[${commandData.id}].targetType[${commandData.targetType}]`);
  }
}

function entityCommandGetResult(game, command, queue$) {
  const entityId = command.sourceId;
  const commandResult = getCommandResult(game, command);
  if (commandResult.status === CommandResultType.SUCCESS) {
    return Rx.of(action$entityCommandScheduleEffect(command));
  } else if (commandResult.status === CommandResultType.REPLACE) {
    return entityCommandGetResult(game, commandResult.replace, queue$)
  } else if (commandResult.status === CommandResultType.FAILURE) {
    return entityCommandRequestActions(game, entityId, queue$)
      .pipe(
        op.concatAll()
        , op.map(command => entityCommandGetResult(game, command, queue$))
        , op.concatMap(a => Rx.isObservable(a) ? a : Rx.of(a))
      )
  } else {
    console.error(`Invalid commandResult`, commandResult);
    throw new Error(`Invalid commandResult ${commandResult}`);
  }
}