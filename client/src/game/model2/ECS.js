import _ from "lodash";
import {Record, Map, List} from "immutable";

export class ECS extends Record({
}) {
  static fromJS(js) {
    return new ECS(js);
  }
}

export class System extends Record({
}) {
  static fromJS(js) {
    return new System(js);
  }

  onUpdate() {
    console.log('position update')
  }
}

export class PositionSystem extends System {
  onUpdate() {
    console.log('position update')
  }
}