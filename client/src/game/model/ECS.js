import _ from "lodash";
import {Record, Map, List} from "immutable";

export class ECS extends Record({
  entityIdCounter: 0
  , systems: Map()
  , emap: Map()
}) {
  static fromJS(js) {
    return new ECS(js);
  }

  addEntity (ientity) {
    const id = this.entityIdCounter + 1;
    const entity = ientity.set('id', id);
    return this
      .set('entityIdCounter', id)
      .setIn(['emap', id], entity)
      .update('systems', systems => systems.map(system => system.onEntityAttach(entity)));
  }
}

export class System extends Record({
  onAttach: _.identity
  , onEntityAttach: _.identity
}) {
  static fromJS(js) {
    return new System(js);
  }

  onUpdate() {
    console.log('position update')
  }
}

export const SystemId = {
  Position: 'Position'
  , Player: 'Player'
};