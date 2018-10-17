import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";
import {getTileIdOffset, getTileX, getTileY} from "../../const.game";
import {updateViaReduce} from "../Model.utils";
import {applyCommandEffect, getCommandResult} from "./Command.utils";
import {EffectApplier} from "../effects";

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
        .updateEntity(sourceId, entity => entity.setIn(['traits', TraitId.Position], targetId))
        .updateTile(tileId, tile => tile.update('elist', elist => elist.filter(entityId => entityId !== sourceId)))
        .updateTile(targetId, tile => tile.update('elist', elist => elist.push(sourceId)))
        .update(game => sourceId === game.playerId ? game.onEvent('onPlayerMove') : game)
        .onEvent('onEntityLeaveTile', sourceId, tileId)
        .onEvent('onEntityEnterTile', sourceId, targetId);
    }
  })
  , [CommandId.COMBINED]: CommandDataModel.fromJS({
    id: CommandId.COMBINED
    , targetType: CommandTargetType.COMBINED
    , getCommand: (commands) => ({
      id: CommandId.COMBINED, commands
    })
    , getEffect: (game, {commands}) => {
      return game.update(updateViaReduce(commands, applyCommandEffect));
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

        const interactEffect = traitValue;
        const effectApplierFn = EffectApplier[interactEffect.id];
        return CommandResult.getReplaceForced(
          effectApplierFn(game, command, interactEffect, sourceId, targetId)
        );
        // const commandReplacement = CommandData[traitValue].getCommand;
        // return CommandResult.getReplaceForced(
        //   commandReplacement(sourceId, targetId, command.cost)
        // )
      }
    }
    , getCommand: (sourceId, targetId) => ({
      id: CommandId.INTERACT, cost: 10, sourceId, targetId
    })
    , getEffect: g => g
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
      return game
        .updateEntity(targetId, entity => entity
          .updateIn(['traits', TraitId.Impassable], value => !value))
    }
  })
  , [CommandId.OPEN]: CommandDataModel.fromJS({
    id: CommandId.OPEN
    , targetType: CommandTargetType.ENTITY
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.OPEN, sourceId, targetId, cost
    })
    , getEffect: (game, {targetId}) => {
      return game
        .updateEntity(targetId, entity => entity
          .setIn(['traits', TraitId.Impassable], false))
    }
  })
  , [CommandId.CLOSE]: CommandDataModel.fromJS({
    id: CommandId.CLOSE
    , targetType: CommandTargetType.ENTITY
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.CLOSE, sourceId, targetId, cost
    })
    , getEffect: (game, {targetId}) => {
      return game
        .updateEntity(targetId, entity => entity
          .updateIn(['traits', TraitId.Impassable], true))
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