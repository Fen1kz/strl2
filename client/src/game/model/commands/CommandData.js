import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";

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