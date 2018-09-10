import _ from 'lodash';
import {Record, List, Map} from 'immutable';

import CameraModel from './CameraModel.js';

import {SystemId} from "./systems/SystemModel";
import {Position} from "./systems/Position";
import {Player} from "./systems/Player";

// tile > object
// entity > tile (entity.tileId)
// tile xy = tile.xy

class GameModel extends Record({
    running: false
  , entityIdCounter: 0
  , system: Map()
  , tiles: List()
  , emap: Map()
  , camera: new CameraModel()
}) {
  addSystem(system) {
    return this.set('system', system);
  }

  addEntity(ientity) {
    const entity = ientity.id ? ientity : ientity.set('id', 'id' + (this.entityIdCounter + 1));
    return this
      .set('entityIdCounter', entity.id)
      .setIn(['emap', entity.id], entity)
      .update('system', system => system.map(system => system.onEntityAttach(entity)));
  }

  removeEntity(entityId) {
    return this
      // .update('systems', systems => systems.map(system => system.onEntityRemove(entityId)))
      .removeIn(['emap', entityId])
  }

  updateEntity(entityId, updateFn) {
    return this.updateIn(['emap', entityId], updateFn)
  }

  getEntity(entityId) {
    return this.getIn(['emap', entityId]);
  }

  getTile(tileId) {
    return this.getIn(['system', SystemId.Position, 'data', tileId]);
  }

  getPlayer() {
    return this.getEntity('@');
  }
}

export const createDefaultGameModel = () => (new GameModel())
  .addSystem(Position)
  .addSystem(Player);

export const createBlankGameModel = () => (new GameModel())
  .addSystem(Position);

export default GameModel;
