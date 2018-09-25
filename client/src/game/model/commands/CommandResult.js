import {Record} from 'immutable';

export const CommandResultType = {
  SUCCESS: 'SUCCESS'
  , REPLACE: 'REPLACE'
  , FAILURE: 'FAILURE'
};

export class CommandResult extends Record({
  status: null
  , energy: null
  , replace: null
}) {
  static fromJS(status, energy, replace = null) {
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

  static getFailure(game, command) {
    return CommandResult.fromJS(
      CommandResultType.FAILURE
      , game.getEntityEnergy(command.sourceId)
    );
  }
}

export default CommandResult;