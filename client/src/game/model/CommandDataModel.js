import _ from "lodash";
import {Record, Map, List} from "immutable";

export class CommandDataModel extends Record({
  id: null
  , getCommand: null
  , effect: null
}) {
  static fromJS(js) {
    return new CommandDataModel(js);
  }
}

export default CommandDataModel;