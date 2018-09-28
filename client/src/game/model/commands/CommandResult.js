import {Record} from 'immutable';

export const CommandResultType = {
  SUCCESS: 'SUCCESS'
  , REPLACE: 'REPLACE'
  , FAILURE: 'FAILURE'
};

export class CommandResult extends Record({
  status: null
  , energy: 0
  , replace: null
}) {
  static fromJS(status, energy = 0, replace = null) {
    return new CommandResult({
      status
      , energy
      , replace
    });
  }

  static getSuccess(game, command) {
    return CommandResult.fromJS(
      CommandResultType.SUCCESS
      , game.getEntityEnergy(command.sourceId) - command.cost
    );
  }

  static getReplace(game, command) {
    return CommandResult.fromJS(
      CommandResultType.SUCCESS
      , game.getEntityEnergy(command.sourceId)
      , command
    );
  }

  static getFailure(game) {
    return CommandResult.fromJS(
      CommandResultType.FAILURE
    );
  }
}

export default CommandResult;