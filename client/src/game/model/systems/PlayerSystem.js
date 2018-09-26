import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";

import CONST_INPUT from '../../input/rdx.input._';
import CameraModel from "../CameraModel";
import TraitModel from '../TraitModel';
import TraitId from '../traits/TraitId';

import {selectGame} from "../../rdx.game.selectors";
import {action$playerCommand} from "../../rdx.game.actions";
import CommandData from "../commands/CommandData";
import CommandId from "../commands/CommandId";
import {PlayerInputMode, PlayerInputModeType} from "../../input/PlayerInputMode";
import CONST_GAME from "../../rdx.game._";


export function PlayerSystem() {
  return {
    camera: new CameraModel()
    , playerId: null
    , playerMode: PlayerInputMode[PlayerInputModeType.DEFAULT]
    , getPlayer() {
      return this.getEntity(this.playerId)
    }
    , events: {
      onEntityAttach(entity) {
        if (entity.traits.has(TraitId.Player)) {
          const player = entity;
          return this
            .set('playerId', player.id)
            .update('camera', camera =>
              camera.setTo(this.getEntityTileId(player.id)))
        } else {
          return this;
        }
      }
      , onPlayerMove() {
        return this
          .update('camera', camera => camera.setTo(this.getEntityTileId(this.playerId)))
      }
      , [CONST_GAME.playerModeChange] ({modeId, commandFn}) {
        const playerMode = PlayerInputMode[PlayerInputModeType];
        return this.set('playerMode'
          , playerMode.set('commandFn', commandFn)
        )
      }
    }
    , rxEvents: {
      [CONST_INPUT.tileClicked] (state, {tileId}) {
        const game = selectGame(state);
        const player = game.getPlayer(game);
        const playerTile = game.getEntityTileId(player.id);
        const tile = game.getTile(tileId);
        if (tile.isNext(playerTile)) {
          const command = CommandData[CommandId.MOVE].getCommand(player.id, tileId);
          return Rx.of(action$playerCommand(command));
        } else {
          return Rx.NEVER;
        }
      }
      // , [CONST_GAME.setMode] () {
      //
      // }
    }
  }
}