import {List} from "immutable";

export function LevelSystem() {
  return {
    tiles: List()
    , getTile(tileId) {
      return this.getIn(['tiles', tileId]);
    }
    , findEntityIdInTile(tileId, cb) {
      return this.getTile(tileId).elist.find(cb);
    }
    , updateTile(tileId, updateFn) {
      return this.updateIn(['tiles', tileId], updateFn);
    }
  }
}