import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";

export default {
  [CommandId.MOVE]: new CommandDataModel({
    id: CommandId.MOVE
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.MOVE, cost, sourceId
      , targetId
    })
    , getResult: (game, command) => {
      const {sourceId, targetId} = command;
      const tileId = game.getEntityTileId(sourceId);
      const targetTile = game.getTile(targetId);
      const isBlocked = targetTile.elist.some(entityId => game.getEntity(entityId).getTrait(TraitId.Impassable));
      if (isBlocked) {
        return CommandResult.fromJS(CommandResultType.FAILURE);
      }
      return CommandResult.getSuccessfulResult(game, command);
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
  , [CommandId.OPEN]: new CommandDataModel({
    id: CommandId.OPEN
    , getCommand: (sourceId, cost = 10) => ({
      id: CommandId.OPEN, cost, sourceId
    })
    , getEffect: (game, {sourceId}) => {
      return game
        .updateEntity(sourceId, entity => entity.setIn(['traits', TraitId.Impassable], false))
    }
  })
  , [CommandId.CLOSE]: new CommandDataModel({
    id: CommandId.CLOSE
    , getCommand: (sourceId, cost = 10) => ({
      id: CommandId.CLOSE, cost, sourceId
    })
    , getEffect: (game, {sourceId}) => {
      return game
        .updateEntity(sourceId, entity => entity.setIn(['traits', TraitId.Impassable], true))
    }
  })
}