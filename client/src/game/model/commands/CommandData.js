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
import {action$entityApplyEffect, action$entityCommandApplyEffect} from "../../rdx.game.actions";
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
    , resultByTrait: {
      [TraitId.Impassable]: (game, command, trait, sourceId, targetId) => {
        return !trait ? CommandResult.getSuccess(command) : CommandResult.getFailure(command)
      }
      , [TraitId.Interactive]: (game, command, trait, sourceId, targetId) => {
        return CommandResult.getReplace(
          CommandData[CommandId.INTERACT].getCommand(sourceId, targetId)
        )
      }
      , [TraitId.PhysItem]: (game, command, trait, sourceId, targetId) => {
        const source = game.getEntity(sourceId);
        if (!source.hasTrait(TraitId.StatStrength)) {
          return CommandResult.getFailure(command);
        }
        const sourceTileId = game.getEntityTileId(sourceId);
        const target = game.getEntity(targetId);
        const targetTileId = game.getEntityTileId(targetId);
        const offsetX = getTileX(targetTileId) - getTileX(sourceTileId);
        const offsetY = getTileY(targetTileId) - getTileY(sourceTileId);
        const nextTileId = getTileIdOffset(targetTileId, offsetX, offsetY);

        const pushCommand = CommandData[CommandId.MOVE].getCommand(targetId, nextTileId, 0);
        const pushCommandResult = getCommandResult(game, pushCommand);
        if (pushCommandResult.status === CommandResultType.FAILURE) {
          return CommandResult.getFailure(command);
        }
        return CommandResult.getReplace(
          CommandData[CommandId.COMBINED].getCommand([
            pushCommand
            , CommandData[CommandId.MOVE].getCommand(sourceId, targetTileId, command.cost * 2)
          ])
        )
      }
    }
    , resolveCommand: (resolver, command) => {
      const game = resolver.game;
      console.log('resolving move', command);
      const {targetId, targetTileId} = command;
      const target = game.getEntity(targetId);
      const targetTile = game.getTile(targetTileId);

      const moveEffect = resolver.resolveEffect(EffectData.MOVE.getEffect());
      let nextEffect = moveEffect;

      const blockers = targetTile.elist.toArray()
        .filter(entityId => game.getEntityTrait(entityId, TraitId.Impassable));
      if (blockers.length === 0) {
        return Rx.of(action$entityApplyEffect(moveEffect));
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
          return Rx.of(action$entityApplyEffect(
            resolver.resolveEffect(pushEffect)
          ));
        }
      } else if (target.hasTrait(TraitId.AbilityInteract)
        && blockers.some(entityId => game.getEntityTrait(entityId, TraitId.Interactive))) {
          return Rx.of();
      }

      target.hasTrait(TraitId.AbilityInteract);
      // const hasInteractive = targetInteractAbility && resolver.resolveEffect(
      //   EffectData.TILE_FIND.getEffect({
      //     effectId: EffectId.TRAIT_VALUE_GET
      //     , effectData: {traitId: TraitId.Interactive}
      //   })
      // );


      // console.log('MoveEffect', MoveEffect);
      // console.log('Impassable', Impassable);
      return Rx.EMPTY;
      // const Impassable = EffectData.TRAIT_VALUE_GET.getEffect();
      // const MoveEffect = EffectData.MOVE.getEffect(targetTileId)
    }
  })
  // , [CommandId.INTERACT]: CommandDataModel.fromJS({
  //   id: CommandId.INTERACT
  //   , targetType: CommandTargetType.ENTITY
  //   , resultByTrait: {
  //     [TraitId.Interactive]: (game, command, traitValue, sourceId, targetId) => {
  //       const source = game.getEntity(sourceId);
  //       if (!source.hasTrait(TraitId.AbilityInteract)) {
  //         return CommandResult.getFailure(command);
  //       }
  //       if (command.targetId !== targetId) {
  //         return CommandResult.getReplaceForced(
  //           CommandData[CommandId.INTERACT].getCommand(
  //             sourceId, targetId
  //           )
  //         );
  //       }
  //       return CommandResult.getSuccess(command);
  //       // const commandReplacement = CommandData[traitValue].getCommand;
  //       // return CommandResult.getReplaceForced(
  //       //   commandReplacement(sourceId, targetId, command.cost)
  //       // )
  //     }
  //   }
  //   , getCommand: (sourceId, targetId) => ({
  //     id: CommandId.INTERACT, cost: 10, sourceId, targetId
  //   })
  //   , get: (game, {sourceId, targetId}) => {
  //     const traitInteractive = game.getEntityTrait(targetId, TraitId.Interactive);
  //     return traitInteractive;
  //   }
  //   // , get: (game, {sourceId, targetId}) => {
  //   //   console.log(...args);
  //   //   return args[0];
  //   // }
  // })
  , [CommandId.ENTITY_EFFECT]: CommandDataModel.fromJS({
    id: CommandId.ENTITY_EFFECT
    , targetType: CommandTargetType.ENTITY
    , getCommand: MakeGetCommandFn(CommandId.ENTITY_EFFECT, {
      effect: void 0
    })
    , resolveCommand: (resolver, command) => {
      const resolvedEffect = resolver.resolveEffect(command.effect, command);
      // console.log('resolvedEffect', resolvedEffect);
      return Rx.of(action$entityApplyEffect(resolvedEffect));
    }
  })
};

export default CommandData;