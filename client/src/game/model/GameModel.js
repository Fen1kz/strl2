import _ from 'lodash';
import {Record, List} from 'immutable';

import Point from './Point.js';
import PlayerModel from './PlayerModel.js';
import CameraModel from './CameraModel.js';

class LevelModel extends Record({
}) {}

class TileModel extends Record({
  id: void 0, pos: new Point(), text: void 0, next: void 0
}) {}

const TileNextModel = Record({
  N: void 0, E: void 0, S: void 0, W: void 0
});


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

    const getTileId = (x, y) => map[x] && map[x][y] && map[x][y].id || null;

    level.forEach((tile, id) => {
      tile.next = new TileNextModel({
        N:   getTileId(tile.pos.x    , tile.pos.y - 1)
        , E: getTileId(tile.pos.x + 1, tile.pos.y    )
        , S: getTileId(tile.pos.x    , tile.pos.y + 1)
        , W: getTileId(tile.pos.x - 1, tile.pos.y    )
      });
    });
    //
    // console.log(new TileModel(map[10][10]));
    // console.log(new Point().setTo({x: 5, y: 5}));

    return this.set('level', List(level).map(tile => new TileModel(tile)));
  }
}

export default GameModel;
