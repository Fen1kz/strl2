import {Map} from "immutable";

export function LevelSystem() {
  return {
    tiles: Map()
    , getTile(tileId) {
      return this.getIn(['tiles', tileId]);
    }
    , updateTile(tileId, updateFn) {
      return this.updateIn(['tiles', tileId], updateFn);
    }
  }
}