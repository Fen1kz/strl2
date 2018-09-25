import _ from 'lodash';
import * as Rx from 'rxjs';
import * as op from "rxjs/operators";
import {ofType} from "redux-observable";

import {action$inputIntent} from './rdx.input.actions';

import {Key} from '../../util/Keyboard';
import Commands from '../const.commands';
import {action$playerCommand} from "../rdx.game.actions";
import CommandData from "../model/commands/CommandData";
import CommandId from "../model/commands/CommandId";
import {selectGame} from "../rdx.game.selectors";
import CONST_GAME from "../rdx.game._";
import CONST_INPUT from "./rdx.input._";
import {getTileId, getTileX, getTileY} from "../const.game";

const keyCode2inputCommand = {
  [Key.W]: Commands.UP
  , [Key.A]: Commands.LEFT
  , [Key.S]: Commands.DOWN
  , [Key.D]: Commands.RIGHT
};

const inputCommand2offset = {
  [Commands.UP]: {x: 0, y: -1}
  , [Commands.LEFT]: {x: -1, y: 0}
  , [Commands.DOWN]: {x: 0, y: +1}
  , [Commands.RIGHT]: {x: +1, y: 0}
};

const moveCommand = (inputCommand, state) => {
  const game = selectGame(state);
  const player = game.getPlayer(game);
  const playerTileId = game.getEntityTileId(player.id);
  const offset = inputCommand2offset[inputCommand];

  const tileX = getTileX(playerTileId);
  const tileY = getTileY(playerTileId);
  const targetTileId = getTileId(tileX + offset.x, tileY + offset.y);
  const command = CommandData[CommandId.MOVE].getCommand(player.id, targetTileId);
  return Rx.of(action$playerCommand(command));
};

const inputCommand2command = {
  [Commands.UP]: moveCommand
  , [Commands.LEFT]: moveCommand
  , [Commands.DOWN]: moveCommand
  , [Commands.RIGHT]: moveCommand
};

export default [
  // (actions$, state$) => actions$.pipe(ofType('keyDown')
  (actions$, state$) => Rx.fromEvent(document, 'keydown').pipe(
    op.map(e => e.which || e.keyCode || 0)
    , op.map(keyCode => keyCode2inputCommand[keyCode])
    , op.filter(_.identity)
    , op.mergeMap((inputCommand) => inputCommand2command[inputCommand](inputCommand, state$.value))
    // , op.map(action$playerCommand)
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