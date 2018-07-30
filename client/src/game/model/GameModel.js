import _ from 'lodash';
import {Record, List, Map} from 'immutable';

import Point from './Point.js';
import PlayerModel from './PlayerModel.js';
import CameraModel from './CameraModel.js';

import TileModel, {TileNextModel} from './TileModel.js';
import EntityModel, {ENTITY_TRAIT} from './EntityModel.js';

import {getTileId, getTileX, getTileY} from "../const.game";
import {TRAIT_TYPE} from "./EntityModel";

// tile > object
// entity > tile (entity.tileId)
// tile xy = tile.xy

class GameModel extends Record({
  queue: List()
  , running: false
  , tiles: List()
  , emap: Map()
  , camera: new CameraModel()
}) {
  canStart() {
    return !!(this.level && this.player);
  }

  addEntity(entity) {
    return this
      .setIn(['emap', entity.id], entity)
      .setIn(['tiles', entity.tileId, 'elist'], elist => elist.push(entity.id))
  }

  updateEntity(entityId, updateFn) {
    return this.updateIn(['emap', '' + entityId], updateFn)
  }

  getEntity(entityId) {
    return this.getIn(['emap', '' + entityId]);
  }

  getTile(tileId) {
    return this.getIn(['tiles', tileId]);
  }

  getPlayer() {
    return this.getEntity('@');
  }

  parseLevel(data) {
    let TILE_ID_COUNTER = 0;
    let ENTITY_ID_COUNTER = 0;
    const tiles = [];
    const emap = {};
    const text2type = {
      '#': [TRAIT_TYPE.TraitWall]
      , '@': [TRAIT_TYPE.TraitPlayerSpawnPoint]
      , '+': [TRAIT_TYPE.TraitDoor]
    };

    const map = data.map.split('\n')
      .filter(row => row.trim())
      .map((row, y) => row.split('')
        .map((text, x) => {
          const tileId = TILE_ID_COUNTER++;
          const tile = {id: tileId, elist: []};
          tiles.push(tile);

          if (text2type[text]) {
            const entity = {
              id: ENTITY_ID_COUNTER++
              , tileId
              , traitsList: text2type[text]
            };

            tile.elist = [entity.id];
            emap[entity.id] = EntityModel.fromJS(entity);
          }

          return tile;
        }));

    tiles.forEach((tile) => {
      // @formatter:off
      const x = getTileX(tile.id);
      const y = getTileY(tile.id);
      tile.next = {
          N : getTileId(x    , y - 1)
        , E : getTileId(x + 1, y    )
        , S : getTileId(x    , y + 1)
        , W : getTileId(x - 1, y    )
        , NE: getTileId(x + 1, y - 1)
        , NW: getTileId(x - 1, y - 1)
        , SE: getTileId(x + 1, y + 1)
        , SW: getTileId(x - 1, y + 1)
      };
      // @formatter:on
    });

    return this.set('tiles', List(tiles).map(tile => TileModel.fromJS(tile)))
      .set('emap', Map(emap));
  }
}

export default GameModel;
