import {Map, Record} from "immutable";
import CommandData from "../model/commands/CommandData";
import CommandId from "../model/commands/CommandId";
import {getTileIdOffset} from "../const.game";
import {
  action$entityCommand
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
    , onCursorMove(game, offset) {
      const player = game.getPlayer();
      const playerTileId = game.getEntityTileId(player.id);
      const targetTileId = getTileIdOffset(playerTileId, offset.x, offset.y);
      return Rx.of(
        action$entityCommand(
          CommandData[CommandId.MOVE].getCommand({
            sourceId: player.id
            , targetId: player.id
            , targetTileId
          })
        )
      );
    }
  })
  , [PlayerInputModeType.TARGET_NEAR]: PlayerInputModeModel({
    id: PlayerInputModeType.TARGET_NEAR
    , onCursorMove(game, offset) {
      const targetTileId = getTileIdOffset(game.playerMode.cursor, offset.x, offset.y);
      const actions = [
        action$entityCommand(
          CommandData[game.playerMode.commandFn].getCommand({
            sourceId: game.playerId
            , targetTileId
          })
        )
        , action$playerModeChange(PlayerInputModeType.DEFAULT, null)
      ];
      return Rx.from(actions);
    }
  })
  , [PlayerInputModeType.TARGET_FAR]: PlayerInputModeModel({
    id: PlayerInputModeType.TARGET_FAR
    , onCursorMove(game, offset) {
      const targetTileId = getTileIdOffset(game.playerMode.cursor, offset.x, offset.y);
      return Rx.of(action$playerCursorMove(targetTileId));
    }
    , onConfirm(game) {
      const actions = [action$playerModeChange(PlayerInputModeType.DEFAULT, null)];
      actions.unshift(
        action$entityCommand(game.playerMode.commandFn(game.playerMode.cursor))
      );
      return Rx.from(actions);
    }
  })
};