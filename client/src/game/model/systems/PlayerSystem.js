import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import {selectGame} from "../../rdx.game.selectors";
import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";
import CameraModel from "../CameraModel";

import {TraitModel} from '../TraitModel';
import TraitId from '../traits/TraitId';
import CONST_INPUT from '../../input/rdx.input._';
import {action$entityAbility} from "../../rdx.game.actions";


export function PlayerSystem() {
  return {
    camera: new CameraModel()
    , playerId: null
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
    }
    , rxEvents: {
      [CONST_INPUT.tileClicked]: (state, {tileId}) => {
        const game = selectGame(state);
        const player = game.getPlayer(game);
        const playerTile = game.getEntityTileId(player.id);
        const tile = game.getTile(tileId);
        if (tile.isNext(playerTile)) {
          return Rx.of(action$entityAbility(
            'MOVE'
            , player.id
            , tileId
          ));
        } else {
          return Rx.NEVER;
        }
      }
    }
  }
}