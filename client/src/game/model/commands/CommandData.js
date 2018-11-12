import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";
import {getTileIdOffset, getTileX, getTileY} from "../../const.game";
import {updateViaReduce} from "../Model.utils";
import {applyCommandEffect, getCommandResult} from "./Command.utils";
import {EffectApplier} from "../effects";
import EffectData from "../effects/EffectData";

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";
import {
  action$entityApplyEffect, action$entityCommand,
  action$entityCommandApplyEffect,
  action$entityCommandUse
} from "../../rdx.game.actions";
import EffectId from "../effects/EffectId";

export const CommandTargetType = {
  SELF: 'SELF'
  , TILE: 'TILE'
  , ENTITY: 'ENTITY'
  , COMBINED: 'COMBINED'
};

const MakeGetCommandFn = (id, defObj) => (obj) => Object.assign({}, {
  id
  , isCommand: true
  , cost: 10
  , sourceId: void 0
  , targetId: void 0
}, defObj, obj);

const CommandData = {
  [CommandId.MOVE]: CommandDataModel.fromJS({
    id: CommandId.MOVE
    , targetType: CommandTargetType.TILE
    , getCommand: MakeGetCommandFn(CommandId.MOVE, {
      targetTileId: void 0
    })
    , resolveCommand (resolver, command) {
      const game = resolver.game;
      const {targetId, targetTileId} = command;
      const target = game.getEntity(targetId);
      const targetTile = game.getTile(targetTileId);

      const moveEffect = resolver.resolveEffect(EffectData.MOVE.getEffect());
      let nextEffect = moveEffect;

      const blockers = targetTile.elist.toArray()
        .filter(entityId => game.getEntityTrait(entityId, TraitId.Impassable));
      if (blockers.length === 0) {
        return Rx.of(
          action$entityApplyEffect(moveEffect)
          , action$entityCommandUse(command)
        );
      } else if (blockers.length === 1 && target.hasTrait(TraitId.StatStrength)) {
        const entitiesToPush = blockers
          .filter(entityId => game.getEntity(entityId).hasTrait(TraitId.PhysItem));
        if (blockers.length === entitiesToPush.length) {
          const entityId = entitiesToPush[0];
          const sourceTileId = game.getEntityTileId(targetId);
          const offsetX = getTileX(targetTileId) - getTileX(sourceTileId);
          const offsetY = getTileY(targetTileId) - getTileY(sourceTileId);
          const pushTileId = getTileIdOffset(targetTileId, offsetX, offsetY);
          const pushEffect = EffectData.MOVE.getEffect({
            targetId: entityId
            , targetTileId: pushTileId
            , then: moveEffect
          });
          return Rx.of(
            action$entityApplyEffect(resolver.resolveEffect(pushEffect))
            , action$entityCommandUse(command)
          );
        }
      } else if (target.hasTrait(TraitId.AbilityInteract)
        && blockers.some(entityId => game.getEntityTrait(entityId, TraitId.Interactive))) {

        // return Rx.of(action$entityCommand(command));
      }
      // console.log('MoveEffect', MoveEffect);
      // console.log('Impassable', Impassable);
      return Rx.EMPTY;
      // const Impassable = EffectData.TRAIT_VALUE_GET.getEffect();
      // const MoveEffect = EffectData.MOVE.getEffect(targetTileId)
    }
  })
  , [CommandId.INTERACT]: CommandDataModel.fromJS({
    id: CommandId.INTERACT
    , targetType: CommandTargetType.TILE
    , getCommand: MakeGetCommandFn(CommandId.INTERACT, {
      targetTileId: void 0
    })
    , resolveCommand (resolver, command) {
      const game = resolver.game;
      const entityId = game.findEntityIdOnTile(command.
        , (eid) => game.getEntityTrait(eid, TraitId.Interactive));

      if (!entityId || !game.getEntityTrait(command.sourceId, TraitId.AbilityInteract)) {
        return Rx.EMPTY;
      }

      const interactEffect = game.getEntityTrait(entityId, TraitId.Interactive);
      return Rx.of(
        action$entityApplyEffect(resolver.resolveEffect(interactEffect))
        , action$entityCommandUse(command)
      );
    }
  })
  , [CommandId.ENTITY_EFFECT]: CommandDataModel.fromJS({
    id: CommandId.ENTITY_EFFECT
    , targetType: CommandTargetType.ENTITY
    , getCommand: MakeGetCommandFn(CommandId.ENTITY_EFFECT, {
      effect: void 0
    })
    , resolveCommand: (resolver, command) => {
      const resolvedEffect = resolver.resolveEffect(command.effect, command);
      // console.log('resolvedEffect', resolvedEffect);
      return Rx.of(
        action$entityApplyEffect(resolvedEffect)
        , action$entityCommandUse(command)
      );
    }
  })
};

export default CommandData;