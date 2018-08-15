import _ from "lodash";
import {Record, Map, List} from "immutable";

export class TraitModel extends Record({
  id: null
  , onAttach: _.identity
}) {
  static fromJS(js) {
    return new TraitModel(js);
  }
}

export const TraitId = {
  Position: 'Position'
  , PlayerControlled: 'PlayerControlled'
};