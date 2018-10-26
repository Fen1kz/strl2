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
  , get: null
  , resolveEffect: x => x
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
    , get: MakeGetEffectFn(EffectId.TRAIT_VALUE_GET, {
      traitId: void 0
    })
    , resolveEffect: (resolver, effect) => {
      const targetId = resolver.get('targetId', effect);
      const traitId = resolver.get('traitId', effect);
      return resolver.game.getEntityTrait(targetId, traitId);
    }
  })
  , [EffectId.TRAIT_VALUE_SET]: EffectDataModel.fromJS({
    id: EffectId.TRAIT_VALUE_SET
    , get: MakeGetEffectFn(EffectId.TRAIT_VALUE_SET, {
      traitId: void 0
      , value: void 0
    })
    , resolveEffect: (resolver, effect) => {
      const targetId = resolver.get('targetId', effect);
      const traitId = resolver.get('traitId', effect);
      const value = resolver.get('value', effect);
      return resolver.game
        .updateEntity(targetId, entity => entity
          .updateIn(['traits', traitId], value))
    }
  })
  , [EffectId.VALUE_NOT]: EffectDataModel.fromJS({
    id: EffectId.VALUE_NOT
    , get: MakeGetEffectFn(EffectId.VALUE_NOT, {
      value: void 0
    })
    , resolveEffect: (resolver, effect) => {
      const value = resolver.get('value', effect);
      return !value;
    }
  })
  , [EffectId.MOVE]: EffectDataModel.fromJS({
    id: EffectId.MOVE
    , get: MakeGetEffectFn(EffectId.MOVE, {
      targetTileId: void 0
    })
    , resolveEffect: (resolver, effect) => {
      const targetId = resolver.get('targetId', effect);
      const sourceTileId = resolver.game.getEntityTileId(targetId);
      const targetTileId = resolver.get('targetTileId', effect);

      return resolver.game
        .onEvent('onEntityLeaveTile', targetId, sourceTileId)
        .onEvent('onEntityEnterTile', targetId, targetTileId)
        .update(game => targetId === game.playerId ? game.onEvent('onPlayerMove') : game);
    }
  })
};

export default EffectData;