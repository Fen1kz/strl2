import _ from "lodash";
import {Record, Map, List} from "immutable";

export class AbilityModel extends Record({
  id: null
}) {
  static fromJS(js) {
    return new AbilityModel(js);
  }
}

export const AbilityId = {

};