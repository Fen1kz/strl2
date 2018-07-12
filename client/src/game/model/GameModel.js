import _ from 'lodash';
import {Record, List} from 'immutable';

import Point from './Point.js';
import PlayerModel from './PlayerModel.js';
import CameraModel from './CameraModel.js';

import TileModel, {TileNextModel} from './TileModel.js';

class LevelModel extends Record({}) {
}


class GameModel extends Record({
  queue: List()
  , running: false
  , player: null
  , level: null
  , camera: new CameraModel()
}) {
  canStart() {
    return !!(this.level && this.player);
  }

  parseLevel(data) {
    let level = [];

    const map = data.map.split('\n')
      .filter(row => row.trim())
      .map((row, y) => row.split('')
        .map((text, x) => {
          const tile = {pos: new Point({x, y}), text};
          level.push(tile);
          return tile;
        }));

    level.forEach((tile, id) => {
      tile.id = id;
    });

    const getTileId = (x, y) => map[y] && map[y][x] && map[y][x].id || null;

    level.forEach((tile, id) => {
      tile.next = new TileNextModel({
        N: getTileId(tile.pos.x, tile.pos.y - 1)
        , E: getTileId(tile.pos.x + 1, tile.pos.y)
        , S: getTileId(tile.pos.x, tile.pos.y + 1)
        , W: getTileId(tile.pos.x - 1, tile.pos.y)
        , NE: getTileId(tile.pos.x + 1, tile.pos.y - 1)
        , NW: getTileId(tile.pos.x - 1, tile.pos.y - 1)
        , SE: getTileId(tile.pos.x + 1, tile.pos.y + 1)
        , SW: getTileId(tile.pos.x - 1, tile.pos.y + 1)
      });
    });
    //
    // console.log(new TileModel(map[10][10]));
    // console.log(new Point().setTo({x: 5, y: 5}));

    return this.set('level', List(level).map(tile => new TileModel(tile)));
  }
}

export default GameModel;
