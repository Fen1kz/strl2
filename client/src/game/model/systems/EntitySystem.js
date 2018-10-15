import {Map} from "immutable";
import {updateViaReduce} from "../Model.utils";
import TraitData from "../traits/TraitData";

export function EntitySystem() {
  return {
    emap: Map()
    , entityIdCounter: 0
    , addEntity(ientity) {
      const entity = ientity.id ? ientity : ientity.set('id', 'id' + (this.entityIdCounter + 1));
      return this
        .set('entityIdCounter', this.entityIdCounter + 1)
        .setIn(['emap', entity.id], entity)
        .onEvent('onEntityAttach', entity)
    }
    , getEntity(entityId) {
      return this.getIn(['emap', entityId]);
    }
    , getEntityTrait(entityId, traitId) {
      return this.getEntity(entityId).traits.get(traitId);
    }
    , updateEntity(entityId, updateFn) {
      return this.updateIn(['emap', entityId], updateFn)
    }
    , removeEntity(entityId) {
      return this
        .removeIn(['emap', entityId])
    }
    , events: {
      onEntityMove(sourceId, targetTileId) {
        return this.update(updateViaReduce(this.getTraitsOnTile(targetTileId)
          , (game, [entityId, traitId]) => {
            const traitData = TraitData[traitId];
            if (traitData.onTileEvent && traitData.onTileEvent.onEntityMove) {
              return traitData.onTileEvent.onEntityMove(game, entityId, traitId);
            }
            return game;
          }))
      }
    }
  }
}