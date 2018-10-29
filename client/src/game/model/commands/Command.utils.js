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
    console.log('command', command);
    this.scope = {
      sourceId: command.sourceId
      , targetId: command.targetId
    };
  }

  resolveEffect(effect, scope) {
    Object.keys(effect).map(key => {
      const value = effect[key];
      if (key === 'id' || key === 'isEffect') {
        return void 0
      } else if (value !== void 0) {
        if (this.scope[key] === void 0) {
          this.scope[key] = value;
          if (value.isEffect) {
            return value;
          }
        }
      } else if (this.scope[key] === void 0) {
        console.warning('Resolver cannot get', key, 'in', effect);
      } else {
        const scoped = this.scope[key];
        if (scoped.isEffect) {
          effect.value = 
        } else {
          effect.value = scoped;
        }
      }
    }).filter(v => v)
      .forEach(subeffect => {
        this.resolveEffect(subeffect, scope)
      })
    // this.scope
  }

  get(propKey, effect) {
    const propValue = effect[propKey];
    if (propValue) {
      if (propValue.isEffect === true) {
        const value = EffectData[propValue.id].resolveEffect(this, propValue);
        // this.scope[propKey] = value;
        return value;
      } else {
        return propValue;
      }
    } else if (this.scope[propKey]) {
      return this.scope[propKey];
    } else {
      console.warning('Resolved cannot get', propKey, 'in', effect);
    }
  }
}