import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";
import {getTileIdOffset, getTileX, getTileY} from "../../const.game";
import {updateViaReduce} from "../Model.utils";
import {applyCommandEffect, getCommandResult} from "./Command.utils";

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
    , resultSelf: (game, command) => {

    }
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
          CommandData[CommandId.COMBINED].getCommand(
            pushCommand
            , CommandData[CommandId.MOVE].getCommand(sourceId, targetTileId, command.cost * 2)
          )
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
        .update(game => {
          if (sourceId === game.playerId) {
            return game.onEvent('onPlayerMove')
          }
          return game;
        });
    }
  })
  , [CommandId.COMBINED]: CommandDataModel.fromJS({
    id: CommandId.COMBINED
    , targetType: CommandTargetType.COMBINED
    , getCommand: (...commands) => ({
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
        return CommandResult.getReplaceForced(
          TraitData[traitValue].onCommand[CommandId.INTERACT](game, sourceId, targetId)
        )
      }
    }
    , getCommand: (sourceId, targetId) => ({
      id: CommandId.INTERACT, cost: 10, sourceId, targetId
    })
    // , getEffect: (game, command) => {
    //   return TraitData[traitValue].onCommand[CommandId.INTERACT](game, sourceId, targetId)
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
        .updateEntity(targetId, entity => entity.setIn(['traits', TraitId.Impassable], false))
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
        .updateEntity(targetId, entity => entity.setIn(['traits', TraitId.Impassable], false))
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
        .updateEntity(targetId, entity => entity.setIn(['traits', TraitId.Impassable], true))
    }
  })
};

export default CommandData;