import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";
import {getTileIdOffset, getTileX, getTileY} from "../../const.game";

export const CommandTargetType = {
  SELF: 'SELF'
  , TILE: 'TILE'
  , ENTITY: 'ENTITY'
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
      [TraitId.Impassable]: (game, command, trait, sourceId, targetId) =>
        !trait ? CommandResult.getSuccess() : CommandResult.getFailure()
      , [TraitId.Interactive]: (game, command, trait, sourceId, targetId) =>
        CommandResult.getReplace(
          CommandData[CommandId.INTERACT].getCommand(sourceId, targetId)
        )
      , [TraitId.PhysItem]: (game, command, trait, sourceId, targetId) => {
        const source = game.getEntity(sourceId);
        const sourceTileId = game.getEntityTileId(sourceId);
        const target = game.getEntity(targetId);
        const targetTileId = game.getEntityTileId(targetId);
        const offsetX = getTileX(targetTileId) - getTileX(sourceTileId);
        const offsetY = getTileY(targetTileId) - getTileY(sourceTileId);
        const nextTileId = getTileIdOffset(targetTileId, offsetX, offsetY);
        const isBlocked = game.getTile(nextTileId).elist.some(eid => game.getEntityTrait(eid, TraitId.Impassable));
        if (isBlocked) {
          return CommandResult.getFailure();
        }
        return CommandResult.getReplace(
          CommandData[CommandId.FORCE_MOVE].getCommand(sourceId, targetTileId)
          , CommandData[CommandId.FORCE_MOVE].getCommand(targetId, nextTileId)
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
        .onEvent('onPlayerMove')
    }
  })
  , [CommandId.INTERACT]: CommandDataModel.fromJS({
    id: CommandId.INTERACT
    , targetType: CommandTargetType.ENTITY
    , resultByTrait: {
      [TraitId.Interactive]: (game, command, traitValue, sourceId, targetId) =>
        CommandResult.getReplace(
          TraitData[traitValue].onCommand[CommandId.INTERACT](game, sourceId, targetId)
        )
    }
    , getCommand: (sourceId, targetId) => ({
      id: CommandId.INTERACT, cost: 10, sourceId, targetId
    })
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