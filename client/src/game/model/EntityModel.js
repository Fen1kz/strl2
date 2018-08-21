import _ from "lodash";
import {Record, Map, List} from "immutable";

export const STAT = {
  Impassable: 'Impassable'
};

export class EntityModel extends Record({
  id: null
  , data: Map()
}) {
  static fromJS(js) {
    return new EntityModel(js);
  }
}

export default EntityModel;