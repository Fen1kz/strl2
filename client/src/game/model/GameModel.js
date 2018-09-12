import _ from 'lodash';
import {Record, List, Map} from 'immutable';

import CameraModel from './CameraModel.js';

import {SystemId} from "./systems/SystemModel";
import {PositionSystem} from "./systems/PositionSystem";
import {PlayerSystem} from "./systems/PlayerSystem";
import {updateViaReduce} from "./Model.utils";

// tile > object
// entity > tile (entity.tileId)
// tile xy = tile.xy

class GameModel extends Record({
    running: false
  , entityIdCounter: 0
  , system: Record(SystemId.map(v => null))
  , tiles: List()
  , emap: Map()
  , camera: new CameraModel()
}) {
  addSystem(system) {
    return this.setIn(['system', system.id], system)
      .update(game => system.onAttach(game));
  }

  addEntity(ientity) {
    const entity = ientity.id ? ientity : ientity.set('id', 'id' + (this.entityIdCounter + 1));
    return this
      .set('entityIdCounter', this.entityIdCounter + 1)
      .setIn(['emap', entity.id], entity)
      .update(updateViaReduce(this.system, (game, system) => {
        return system.onEntityAttach(game, entity);
      }));
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
  .addSystem(PositionSystem)
  .addSystem(PlayerSystem);

export const createBlankGameModel = () => (new GameModel())
  .addSystem(PositionSystem);

export default GameModel;
