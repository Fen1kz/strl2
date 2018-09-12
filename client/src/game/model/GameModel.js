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

const SystemRecord = Record(_.mapValues(SystemId, v => null));

class GameModel extends Record({
    running: false
  , entityIdCounter: 0
  , system: new SystemRecord()
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
        return system ? system.onEntityAttach(game, entity) : game;
      }));
  }

  removeEntity(entityId) {
    return this
      // .update('systems', systems => systems.map(system => system.onEntityRemove(entityId)))
      .removeIn(['emap', entityId])
  }

  getEntity(entityId) {
    return this.getIn(['emap', entityId]);
  }

  updateEntity(entityId, updateFn) {
    return this.updateIn(['emap', entityId], updateFn)
  }

  getTile(tileId) {
    // return this.getIn(['system', SystemId.Position, 'data', tileId]);
    return this.getIn(['tiles', tileId]);
  }

  updateTile(tileId, updateFn) {
    return this.updateIn(['tiles', tileId], updateFn);
  }

  getPlayer() {
    return this.getEntity('@');
  }

  onEvent(state, event) {
    return this
      .set('entityIdCounter', this.entityIdCounter + 1)
      .setIn(['emap', entity.id], entity)
      .update(updateViaReduce(this.system, (game, system) => {
        return system ? system.onEntityAttach(game, entity) : game;
      }));
  }
}

export const createDefaultGameModel = () => (new GameModel())
  .addSystem(PositionSystem)
  .addSystem(PlayerSystem);

export const createBlankGameModel = () => (new GameModel())
  .addSystem(PositionSystem);

export default GameModel;
