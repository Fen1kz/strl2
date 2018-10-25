import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";
import {getTileIdOffset, getTileX, getTileY} from "../../const.game";
import {updateViaReduce} from "../Model.utils";
import {applyCommandEffect, getCommandResult} from "./Command.utils";
import {EffectApplier} from "../effects";
import EffectId from "./EffectId";
import {Record} from "immutable";

class EffectDataModel extends Record({
  id: null
  , applyEffect: x => x
}) {static fromJS(js){return new EffectDataModel(js)}}

// class EffectModel extends Record

const EffectData = {
  [EffectId.TRAIT_VALUE_CHANGE]: EffectDataModel.fromJS({
    id: EffectId.TRAIT_VALUE_SET
    , getEffect: (targetId, traitId, value) => ({
      id: EffectId.TRAIT_VALUE_SET
      , targetId
      , traitId
      , value
    })
    , applyEffect: (game, effect) => {
      return game
        .updateEntity(effect.targetId, entity => entity
          .updateIn(['traits', effect.traitId], effect.value))
    }
  })
  , [EffectId.CLOSE]: EffectDataModel.fromJS({
    id: EffectId.CLOSE
    , getEffect: (targetId) => ({
      id: EffectId.CLOSE
      , targetId
    })
    , applyEffect: (game, effect) => {
      return game
        .updateEntity(effect.targetId, entity => entity
          .updateIn(['traits', TraitId.Impassable], value => true))
    }
  })
};

export default EffectData;