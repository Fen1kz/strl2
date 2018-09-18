import {List} from "immutable";

export function LevelSystem() {
  return {
    tiles: List()
    , getTile(tileId) {
      return this.getIn(['tiles', tileId]);
    }
    , updateTile(tileId, updateFn) {
      return this.updateIn(['tiles', tileId], updateFn);
    }
  }
}