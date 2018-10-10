import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import {action$playerCommand, action$playerModeChange} from "../rdx.game.actions";
import CommandData from "../model/commands/CommandData";
import CommandId from "../model/commands/CommandId";
import {selectGame} from "../rdx.game.selectors";
import CONST_GAME from "../rdx.game._";
import CONST_INPUT from "./rdx.input._";
import {PlayerInputModeType} from "./PlayerInputMode";
import {getTileId, getTileX, getTileY} from "../const.game";
import TraitId from "../model/traits/TraitId";
import {action$inputPlayer} from "./rdx.input.actions";

const Key = {
  W: 87
  , D: 68
  , A: 65
  , S: 83
  , E: 69
  , SPACE: 32
};

const KeyCommands = {
  UP: 'UP'
  , LEFT: 'LEFT'
  , RIGHT: 'RIGHT'
  , DOWN: 'DOWN'
  , INTERACT: 'INTERACT'
};

const keyCode2keyCommand = {
  [Key.W]: KeyCommands.UP
  , [Key.A]: KeyCommands.LEFT
  , [Key.S]: KeyCommands.DOWN
  , [Key.D]: KeyCommands.RIGHT
  , [Key.E]: KeyCommands.INTERACT
};

const keyCommand2offset = {
  [KeyCommands.UP]: {x: 0, y: -1}
  , [KeyCommands.LEFT]: {x: -1, y: 0}
  , [KeyCommands.DOWN]: {x: 0, y: +1}
  , [KeyCommands.RIGHT]: {x: +1, y: 0}
};

const moveCommand = (keyCommand) => {
  const offset = keyCommand2offset[keyCommand];

  return {
    type: CONST_INPUT.InputCommand_MOVE
    , offset
  };
};

const keyCommand2inputCommand = {
  [KeyCommands.UP]: moveCommand
  , [KeyCommands.LEFT]: moveCommand
  , [KeyCommands.DOWN]: moveCommand
  , [KeyCommands.RIGHT]: moveCommand
  , [KeyCommands.INTERACT]: (state) => {
    return {
      type: CONST_INPUT.InputCommand_PLAYER_MODE_CHANGE
      , playerModeType: PlayerInputModeType.TARGET_NEAR
      , command: CommandId.INTERACT
    };
  }
};

export default [
  // (actions$, state$) => actions$.pipe(ofType('keyDown')
  (actions$, state$) => Rx.fromEvent(document, 'keyup').pipe(
    op.map(e => e.which || e.keyCode || 0)
    , op.map(keyCode => keyCode2keyCommand[keyCode])
    , op.filter(_.identity)
    , op.timeInterval()
    , op.mergeMap(({interval, value: keyCommand}) => {
      const inputCommand = keyCommand2inputCommand[keyCommand](keyCommand);
      return Rx.of(action$inputPlayer(inputCommand, interval));
    })
  )
  , (actions$, state$) => Rx.merge(
    actions$.pipe(ofType(CONST_INPUT.tileClicked))
    , actions$.pipe(ofType(CONST_INPUT.entityClicked))
  ).pipe(
    op.pluck('data')
    , op.mergeMap(({tileId}) => {
      const game = selectGame(state$.value);
      const player = game.getPlayer(game);
      const playerTile = game.getEntityTileId(player.id);
      const tile = game.getTile(tileId);
      if (tile.isNext(playerTile)) {
        const command = CommandData[CommandId.MOVE].getCommand(player.id, tileId);
        return Rx.of(action$playerCommand(command));
      } else {
        return Rx.NEVER;
      }
    })
  )
];