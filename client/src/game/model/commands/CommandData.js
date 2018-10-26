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
import {EffectId} from "../EffectModel";

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";
import {action$entityApplyEffect, action$entityCommandApplyEffect} from "../../rdx.game.actions";

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
    , getCommand: MakeGetCommandFn(CommandId.ENTITY_EFFECT, {
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
    , getEffect: (game, {sourceId, targetTileId}) => {
      const Impassable = EffectData.TRAIT_VALUE_GET.get();
      const MoveEffect = EffectData.MOVE.get(targetTileId)
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
      const resolvedEffect = EffectData[command.effect.id].resolveEffect(resolver, command.effect);
      return Rx.of(action$entityApplyEffect(resolvedEffect));
    }
  })
};

export default CommandData;