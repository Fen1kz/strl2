import {Record} from 'immutable';

export const CommandResultType = {
  SUCCESS: 'SUCCESS'
  , REPLACE: 'REPLACE'
  , REPLACE_FORCED: 'REPLACE_FORCED'
  , UNCLEAR: 'UNCLEAR'
  , FAILURE: 'FAILURE'
};

export class CommandResult extends Record({
  status: null
  , command: null
}) {
  static fromJS(status, command = null) {
    return new CommandResult({
      status
      , command
    });
  }

  static getSuccess(command) {
    return CommandResult.fromJS(CommandResultType.SUCCESS, command);
  }

  static getReplace(command) {
    return CommandResult.fromJS(CommandResultType.REPLACE, command);
  }

  static getReplaceForced(command) {
    return CommandResult.fromJS(CommandResultType.REPLACE_FORCED, command);
  }

  static getFailure(command) {
    return CommandResult.fromJS(CommandResultType.FAILURE, command);
  }
}

export default CommandResult;