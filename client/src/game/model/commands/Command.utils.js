import {CommandResultType} from "./CommandResult";
import CommandData, {CommandTargetType} from "./CommandData";
import CommandResult from "./CommandResult";
import EffectData from "../effects/EffectData";

export function getCommandResult(game, command) {
  const commandData = CommandData[command.id];
  if (commandData.targetType === CommandTargetType.TILE) {
    return getCommandResultByTile(game, command)
  } else if (commandData.targetType === CommandTargetType.ENTITY) {
    return getCommandResultByEntity(game, command, command.targetId)
  } else if (commandData.targetType === CommandTargetType.SELF) {
    return CommandResult.getSuccess(command);
  } else if (commandData.targetType === CommandTargetType.COMBINED) {
    return CommandResult.getSuccess(command);
  } else {
    throw new Error(`Unknown commandData[${commandData.id}].targetType[${commandData.targetType}]`);
  }
}

function getCommandResultByTile(game, command) {
  const commandData = CommandData[command.id];
  const tileId = command.targetId;
  let resultSuccess = true;
  let resultReplace = null;
  game.getTile(tileId).elist.some(entityId => {
    game.getEntity(entityId).traits
      .some((traitValue, traitId) => {
        const resultByTraitFn = commandData.resultByTrait[traitId];
        if (resultByTraitFn) {
          const result = resultByTraitFn(game, command, traitValue, command.sourceId, entityId);
          if (result.status === CommandResultType.FAILURE) {
            resultSuccess = false;
          } else if (result.status === CommandResultType.REPLACE) {
            resultReplace = result;
          } else if (result.status === CommandResultType.REPLACE_FORCED) {
            resultSuccess = false;
            resultReplace = result;
          }
        }
      });
    return (!resultSuccess && resultReplace);
  });
  return compileCommandResult(resultSuccess, resultReplace);
}

function getCommandResultByEntity(game, command, entityId) {
  const commandData = CommandData[command.id];
  let resultSuccess = true;
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
        } else if (result.status === CommandResultType.REPLACE_FORCED) {
          resultSuccess = false;
          resultReplace = result;
        }
        return (!resultSuccess && resultReplace);
      }
    });
  return compileCommandResult(resultSuccess, resultReplace);
}

function compileCommandResult(resultSuccess, resultReplace) {
  if (resultSuccess) {
    if (resultReplace) {
      return CommandResult.getSuccess(resultReplace.command);
    }
    return CommandResult.getSuccess();
  } else {
    if (resultReplace) {
      return resultReplace;
    }
  }
  return CommandResult.getFailure()
}

// Applying
export function applyCommandEffect(game, command) {
  const commandData = CommandData[command.id];
  const commandResult = getCommandResult(game, command);
  let updatedGame = game;
  if (command.queue) {
    console.log('FOUND COMMAND WITH QUEUE');
    console.log(updatedGame.queue.toJS());
    updatedGame = game.update('queue', queue => queue.shift());
    console.log(updatedGame.queue.toJS());
  }
  if (commandResult.status === CommandResultType.SUCCESS) {
    updatedGame = commandData.get(game, command);
    if (command.sourceId && command.cost) {
      return updatedGame
        .updateEntityEnergy(command.sourceId, energy => energy - command.cost);
    }
  }
  return updatedGame;
}

export class CommandResolver {
  constructor(game, command) {
    this.game = game;
    this.command = command;
  }

  resolveEffect(effect) {
    // console.log('resolving', effect, this);
    Object.keys(effect).map(key => {
      const value = effect[key];
      const commandValue = this.command[key];
      if (key === 'id' || key === 'isEffect' || key === 'eval') {
        return;
      } else if (value !== void 0) {
        if (value.isEffect === true && !value.eval) {
          effect[key] = this.resolveEffect(value);
        }
      } else if (commandValue !== void 0) {
        effect[key] = commandValue;
      } else {
        console.warn('Resolver cannot get', key, 'in', effect);
      }
    });
    // console.log('returning', effect);
    return EffectData[effect.id].resolveEffect(effect, this);
  }
}