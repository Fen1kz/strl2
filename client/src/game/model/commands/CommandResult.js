import {Record} from 'immutable';

export const CommandResultType = {
  SUCCESS: 'SUCCESS'
  , REPLACE: 'REPLACE'
  , FAILURE: 'FAILURE'
};

export class CommandResult extends Record({
  status: null
  , replace: null
}) {
  static fromJS(status, replace = null) {
    return new CommandResult({
      status
      , replace
    });
  }

  static getSuccess() {
    return CommandResult.fromJS(
      CommandResultType.SUCCESS
    );
  }

  static getReplace(command) {
    return CommandResult.fromJS(
      CommandResultType.REPLACE
      , command
    );
  }

  static getFailure() {
    return CommandResult.fromJS(
      CommandResultType.FAILURE
    );
  }
}

export default CommandResult;