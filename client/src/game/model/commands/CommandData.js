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

export const CommandTargetType = {
  SELF: 'SELF'
  , TILE: 'TILE'
  , ENTITY: 'ENTITY'
  , COMBINED: 'COMBINED'
};

const CommandData = {
  [CommandId.MOVE]: CommandDataModel.fromJS({
    id: CommandId.MOVE
    , targetType: CommandTargetType.TILE
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.MOVE, cost, sourceId
      , targetId
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
    , getEffect: (game, {sourceId, targetId}) => {
      const tileId = game.getEntityTileId(sourceId);
      const targetTile = game.getTile(targetId);
      return game
        .updateTile(tileId, tile => tile.update('elist', elist => elist.filter(entityId => entityId !== sourceId)))
        .onEvent('onEntityLeaveTile', sourceId, tileId)
        .updateEntity(sourceId, entity => entity.setIn(['traits', TraitId.Position], targetId))
        .onEvent('onEntityEnterTile', sourceId, targetId)
        .updateTile(targetId, tile => tile.update('elist', elist => elist.push(sourceId)))
        .update(game => sourceId === game.playerId ? game.onEvent('onPlayerMove') : game);
    }
  })
  , [CommandId.INTERACT]: CommandDataModel.fromJS({
    id: CommandId.INTERACT
    , targetType: CommandTargetType.ENTITY
    , resultByTrait: {
      [TraitId.Interactive]: (game, command, traitValue, sourceId, targetId) => {
        const source = game.getEntity(sourceId);
        if (!source.hasTrait(TraitId.AbilityInteract)) {
          return CommandResult.getFailure(command);
        }
        if (command.targetId !== targetId) {
          return CommandResult.getReplaceForced(
            CommandData[CommandId.INTERACT].getCommand(
              sourceId, targetId
            )
          );
        }
        return CommandResult.getSuccess(command);
        // const commandReplacement = CommandData[traitValue].getCommand;
        // return CommandResult.getReplaceForced(
        //   commandReplacement(sourceId, targetId, command.cost)
        // )
      }
    }
    , getCommand: (sourceId, targetId) => ({
      id: CommandId.INTERACT, cost: 10, sourceId, targetId
    })
    , getEffect: (game, {sourceId, targetId}) => {
      const traitInteractive = game.getEntityTrait(targetId, TraitId.Interactive);
      return traitInteractive;
    }
    // , getEffect: (game, {sourceId, targetId}) => {
    //   console.log(...args);
    //   return args[0];
    // }
  })
  , [CommandId.SWITCH]: CommandDataModel.fromJS({
    id: CommandId.SWITCH
    , targetType: CommandTargetType.ENTITY
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.SWITCH, sourceId, targetId, cost
    })
    , getEffect: (game, {targetId}) => {
      const traitImpassable = game.getEntityTrait(targetId, TraitId.Impassable);
      return EffectData[traitImpassable ? EffectId.OPEN : EffectId.CLOSE]
        .getEffect(targetId);
    }
  })
  , [CommandId.OPEN]: CommandDataModel.fromJS({
    id: CommandId.OPEN
    , targetType: CommandTargetType.ENTITY
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.OPEN, sourceId, targetId, cost
    })
    , getEffect: (game, {targetId}) => {
      return EffectData[EffectId.OPEN].getEffect(sourceId, targetId);;
    }
  })
  , [CommandId.CLOSE]: CommandDataModel.fromJS({
    id: CommandId.CLOSE
    , targetType: CommandTargetType.ENTITY
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.CLOSE, sourceId, targetId, cost
    })
    , getEffect: (game, {sourceId, targetId}) => {
      return EffectData[EffectId.CLOSE].getEffect(sourceId, targetId);
    }
  })
  // , [CommandId.SIGNAL_EMIT]: CommandDataModel.fromJS({
  //   id: CommandId.SIGNAL_EMIT
  //   , targetType: CommandTargetType.ENTITY
  //   , getCommand: (sourceId, targetId, cost = 10) => ({
  //     id: CommandId.SIGNAL_EMIT, sourceId, targetId, cost
  //   })
  //   , resultByTrait: {
  //     [TraitId.Wire]: (game, command, traitValue, sourceId, targetId) => {
  //       return CommandResult.getReplaceForced({
  //         id: CommandId.SIGNAL_TRAVERSE
  //         , sourceId
  //         , targets: traitValue.get('targets')
  //         , cost: command.cost
  //       })
  //     }
  //   }
  //   , getEffect: g => g
  // })
  // , [CommandId.SIGNAL_TRAVERSE]: CommandDataModel.fromJS({
  //   id: CommandId.SIGNAL_TRAVERSE
  //   , targetType: CommandTargetType.SELF
  //   , getCommand: (sourceId, targets, cost = 10) => ({
  //     id: CommandId.SIGNAL_TRAVERSE, sourceId, targets, cost
  //   })
  //   , getEffect: (game, command) => {
  //     return game.update(updateViaReduce(command.targets, (game, targetId) => {
  //       const trait = game.getEntityTrait(targetId, TraitId.Wire);
  //       const commandId = trait.get('onSignal');
  //       const getEffectFn = CommandData[commandId].getEffect;
  //       return getEffectFn(game, {
  //         sourceId: command.sourceId
  //         , targetId
  //       });
  //     }))
  //   }
  // })
};

export default CommandData;