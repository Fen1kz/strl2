import _ from "lodash";
import {Record, Map, List} from "immutable";

export class TraitModel extends Record({
  id: null
  , defaultData: null
  , onAttach: _.identity
  , getAction: null
}) {
  static fromJS(js) {
    return new TraitModel(js);
  }
}

export default TraitModel;