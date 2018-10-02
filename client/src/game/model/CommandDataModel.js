import _ from "lodash";
import {Record, Map, List} from "immutable";
import CommandResult, {CommandResultType} from "./commands/CommandResult";

export class CommandDataModel extends Record({
  id: null
  , targetType: null
  , getCommand: null
  , resultDefault: CommandResult.getSuccess()
  , resultByTrait: Map()
  , getEffect: null
}) {
  static fromJS(js) {
    return new CommandDataModel(js)
  }
}

export default CommandDataModel;