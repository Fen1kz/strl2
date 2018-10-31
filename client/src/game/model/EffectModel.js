import _ from "lodash";
import {Record, Map, List} from "immutable";

export class EffectModel extends Record({
  id: null
}) {
  static fromJS(js) {
    return new EffectModel(js);
  }
}