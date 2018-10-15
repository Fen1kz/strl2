import {List} from "immutable";

export function LevelSystem() {
  return {
    tiles: List()
    , getTile(tileId) {
      return this.getIn(['tiles', tileId]);
    }
    , findEntityIdOnTile(tileId, cb) {
      return this.getTile(tileId).elist.find(cb);
    }
    , getEntitiesOnTile(tileId) {
      return this.getTile(tileId).elist.map(this.getEntity);
    }
    , getTraitsOnTile(tileId) {
      return this.getTile(tileId).elist.reduce((list, entityId) => {
        return list.concat(
          this.getEntity(entityId).traits
            .keySeq()
            .map(traitId => [entityId, traitId])
            .toArray()
        )
      }, []);
    }
    , updateTile(tileId, updateFn) {
      return this.updateIn(['tiles', tileId], updateFn);
    }
  }
}