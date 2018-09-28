import {Map, Record} from "immutable";
import CommandData from "../model/commands/CommandData";
import CommandId from "../model/commands/CommandId";
import {getTileIdOffset} from "../const.game";
import {
  action$playerCommand
  , action$playerCursorMove, action$playerModeChange
} from "../rdx.game.actions";
import {selectGame} from "../rdx.game.selectors"
import * as Rx from "rxjs";
import TraitId from "../model/traits/TraitId";

export const PlayerInputModeModel = Record({
  id: null
  , cursor: null
  , commandFn: null
  , onCursorMove: null
  , onConfirm: null
}, 'PlayerInputModeModel');

export const PlayerInputModeType = {
  DEFAULT: 'DEFAULT'
  , TARGET_NEAR: 'TARGET_NEAR'
  , TARGET_FAR: 'TARGET_FAR'
};

export const PlayerInputMode = {
  [PlayerInputModeType.DEFAULT]: PlayerInputModeModel({
    id: PlayerInputModeType.DEFAULT
    , onCursorMove(state, offset) {
      const game = selectGame(state);
      const player = game.getPlayer(game);
      const playerTileId = game.getEntityTileId(player.id);
      const targetTileId = getTileIdOffset(playerTileId, offset.x, offset.y);
      return Rx.of(
        action$playerCommand(
          CommandData[CommandId.MOVE].getCommand(player.id, targetTileId)
        )
      );
    }
  })
  , [PlayerInputModeType.TARGET_NEAR]: PlayerInputModeModel({
    id: PlayerInputModeType.TARGET_NEAR
    , onCursorMove(state, offset) {
      const game = selectGame(state);
      const targetTileId = getTileIdOffset(game.playerMode.cursor, offset.x, offset.y);
      const actions = [action$playerModeChange(PlayerInputModeType.DEFAULT, null)];
      const entityIdInteractive = game.findEntityIdInTile(targetTileId
        , (eid) => game.getEntityTrait(eid, TraitId.Interactive));
      if (entityIdInteractive) {
        actions.unshift(action$playerCommand(game.playerMode.commandFn(game, entityIdInteractive)))
      }
      return Rx.from(actions);
    }
  })
  , [PlayerInputModeType.TARGET_FAR]: PlayerInputModeModel({
    id: PlayerInputModeType.TARGET_FAR
    , onCursorMove(state, offset) {
      const game = selectGame(state);
      const targetTileId = getTileIdOffset(game.playerMode.cursor, offset.x, offset.y);
      return Rx.of(action$playerCursorMove(targetTileId));
    }
    , onConfirm(state) {
      const game = selectGame(state);
      const actions = [action$playerModeChange(PlayerInputModeType.DEFAULT, null)];
      actions.unshift(
        action$playerCommand(game.playerMode.commandFn(game.playerMode.cursor))
      );
      return Rx.from(actions);
    }
  })
};