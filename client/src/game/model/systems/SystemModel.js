import _ from "lodash";
import {Record, Map, List} from "immutable";

export class SystemModel extends Record({
  id: null
  , data: null
  , onAttach: _.identity
  , onEntityAttach: _.identity
  , onUpdate: _.identity
  , eventMap: Map()
}) {
  static fromJS(js) {
    return new SystemModel(js)
      .set('eventMap', Map(js.eventMap));
  }
}

export const SystemId = {
  Position: 'Position'
  , Player: 'Player'
};

export default SystemModel;