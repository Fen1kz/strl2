import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import TraitData from "../traits/TraitData";
import {getTileIdOffset, getTileX, getTileY} from "../../const.game";
import {updateViaReduce} from "../Model.utils";
import {EffectApplier} from "../effects";
import EffectId from "./EffectId";
import {Record} from "immutable";

class EffectDataModel extends Record({
  id: null
  , getEffect: null
  , resolveEffect: x => x
  , applyEffect: x => x
}) {static fromJS(js){return new EffectDataModel(js)}}

const MakeGetEffectFn = (id, defObj) => (obj) => Object.assign({}, {
  id
  , isEffect: true
  , sourceId: void 0
  , casterId: void 0
  , targetId: void 0
}, defObj, obj);

const EffectData = {
  [EffectId.TRAIT_VALUE_GET]: EffectDataModel.fromJS({
    id: EffectId.TRAIT_VALUE_GET
    , getEffect: MakeGetEffectFn(EffectId.TRAIT_VALUE_GET, {
      traitId: void 0
    })
    , resolveEffect: (effect, resolver) => {
      const {targetId, traitId} = effect;
      return resolver.game.getEntityTrait(targetId, traitId);
    }
  })
  , [EffectId.TRAIT_VALUE_SET]: EffectDataModel.fromJS({
    id: EffectId.TRAIT_VALUE_SET
    , getEffect: MakeGetEffectFn(EffectId.TRAIT_VALUE_SET, {
      traitId: void 0
      , value: void 0
    })
    , applyEffect: (game, effect) => {
      const {targetId, value, traitId} = effect;
      return game
        .updateEntity(targetId, entity => entity
          .setIn(['traits', traitId], value))
    }
  })
  , [EffectId.VALUE_NOT]: EffectDataModel.fromJS({
    id: EffectId.VALUE_NOT
    , getEffect: MakeGetEffectFn(EffectId.VALUE_NOT, {
      value: void 0
    })
    , resolveEffect: (effect, resolver) => {
      return !effect.value;
    }
  })
  , [EffectId.MOVE]: EffectDataModel.fromJS({
    id: EffectId.MOVE
    , getEffect: MakeGetEffectFn(EffectId.MOVE, {
      targetTileId: void 0
    })
    , applyEffect(game, effect) {
      const {targetId, targetTileId} = effect;
      const sourceTileId = game.getEntityTileId(targetId);
      return game
        .onEvent('onEntityLeaveTile', targetId, sourceTileId)
        .onEvent('onEntityEnterTile', targetId, targetTileId)
        .update(game => targetId === game.playerId ? game.onEvent('onPlayerMove') : game);
    }
  })
  , [EffectId.TILE_FIND]: EffectDataModel.fromJS({
    id: EffectId.TILE_FIND
    , getEffect: MakeGetEffectFn(EffectId.TILE_FIND, {
      targetTileId: void 0
      , effect: void 0
      , effectId: void 0
    })
    , resolveEffect: (effect, resolver) => {
      const {targetTileId, effectId, effectData} = effect;
      let result = null;
      const entityId = resolver.game.getTile(targetTileId).elist.some(entityId => {
        result = resolver.resolveEffect(
          EffectData[effect.effectId].getEffect({
            targetId: entityId
            , ...effectData
          })
        );
        if (result) return true;
      });
      return result;
    }
  })
};

export default EffectData;