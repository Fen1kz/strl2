import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";
import TraitId from "../traits/TraitId";
import CommandResult, {CommandResultType} from "./CommandResult";
import TraitData from "../traits/TraitData";

export default {
  [CommandId.MOVE]: CommandDataModel.fromJS({
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
      const interactiveEntityId = targetTile.elist.find(entityId => game.getEntity(entityId).getTrait(TraitId.Interactive));
      if (isBlocked) {
        if (interactiveEntityId) {
          const source = game.getEntity(sourceId);
          const target = game.getEntity(interactiveEntityId);
          return CommandResult.fromJS(CommandResultType.REPLACE, 0, TraitData[TraitId.Interactive].getAction(game, source, target));
        }
        return CommandResult.fromJS(CommandResultType.FAILURE);
      }
      return CommandResult.getSuccess(game, command);
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
  , [CommandId.TARGET]: CommandDataModel.fromJS({
    id: CommandId.TARGET
    , getCommand: (sourceId, mode) => ({
      id: CommandId.TARGET, cost: 0, sourceId, mode
    })
    , getResult: CommandResult.getSuccess
    , getEffect: (game, {sourceId, mode}) => {
      return game
        .set('mode', mode)
    }
  })
  , [CommandId.TARGET_CANCEL]: CommandDataModel.fromJS({
    id: CommandId.TARGET_CANCEL
    , getCommand: (sourceId, mode) => ({
      id: CommandId.TARGET_CANCEL, cost: 0, sourceId
    })
    , getResult: CommandResult.getSuccess
    , getEffect: (game, {sourceId, mode}) => {
      return game
        .set('mode', null)
    }
  })
  , [CommandId.INTERACT]: CommandDataModel.fromJS({
    id: CommandId.INTERACT
    , getCommand: (sourceId, targetId) => ({
      id: CommandId.INTERACT, cost: 0, sourceId, targetId
    })
    , getResult: (game, command) => {
      const {sourceId, targetId} = command;
      const source = game.getEntity(sourceId);
      const target = game.getEntity(interactiveEntityId);
      return CommandResult.fromJS(CommandResultType.REPLACE
        , 0
        , TraitData[TraitId.Interactive].getAction(game, source, target));
    }
  })
  , [CommandId.OPEN]: CommandDataModel.fromJS({
    id: CommandId.OPEN
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
    , getCommand: (sourceId, targetId, cost = 10) => ({
      id: CommandId.CLOSE, sourceId, targetId, cost
    })
    , getEffect: (game, {targetId}) => {
      return game
        .updateEntity(targetId, entity => entity.setIn(['traits', TraitId.Impassable], true))
    }
  })
}