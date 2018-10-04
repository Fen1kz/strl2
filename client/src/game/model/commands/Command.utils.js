import {CommandResultType} from "./CommandResult";
import CommandData, {CommandTargetType} from "./CommandData";
import CommandResult from "./CommandResult";

export function getCommandResult(game, command) {
  const commandData = CommandData[command.id];
  if (commandData.targetType === CommandTargetType.TILE) {
    return getCommandResultByTile(game, command)
  } else if (commandData.targetType === CommandTargetType.ENTITY) {
    return getCommandResultByEntity(game, command, command.targetId)
  } else if (commandData.targetType === CommandTargetType.SELF) {
    return CommandResult.getSuccess(command);
  }  else if (commandData.targetType === CommandTargetType.COMBINED) {
    return CommandResult.getSuccess(command);
  } else {
    throw new Error(`Unknown commandData[${commandData.id}].targetType[${commandData.targetType}]`);
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
    } else if (result.status === CommandResultType.REPLACE_FORCED) {
      resultSuccess = false;
      resultReplace = result;
    }
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
    return CommandResult.getSuccess();
  }
  if (resultReplace) {
    return resultReplace;
  }
  return CommandResult.getFailure()
}

// Applying
export function applyCommandEffect(game, command) {
  const commandData = CommandData[command.id];
  const commandResult = getCommandResult(game, command);
  if (commandResult.status !== CommandResultType.SUCCESS) {
    return game;
  }
  const updatedGame = commandData.getEffect(game, command);
  if (command.sourceId && command.cost) {
    return updatedGame
      .updateEntityEnergy(command.sourceId, energy => energy - command.cost);
  }
  return updatedGame;
}