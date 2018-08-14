import _ from "lodash";
import {Record, Map, List} from "immutable";

export class BehaviorModel extends Record({
  id: null
}) {
  static fromJS(js) {
    return new BehaviorModel(js);
  }
}

export const BehaviorId = {
  AutoDoor: 'AutoDoor'
};