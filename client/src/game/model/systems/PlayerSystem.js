import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import {selectGame} from "../../rdx.game.selectors";
import * as Rx from "rxjs/index";
import CameraModel from "../CameraModel";

import {TraitModel, TraitId} from '../TraitModel';
import CONST_INPUT from '../../input/rdx.input._';
import {action$entityAbility} from "../../rdx.game.actions";


export function PlayerSystem() {
  return {
    camera: new CameraModel()
    , playerId: null
    , getPlayer(game) {
      return game.getEntity(this.playerId)
    }
    , events: {
      onEntityAttach(entity) {
        if (entity.traits.has(TraitId.TraitPlayer)) {
          const player = entity;
          return this
            .set('playerId', player.id)
            .update('camera', camera =>
              camera.setTo(player.data.get('tileId')))
        } else {
          return this;
        }
      }
      , [CONST_INPUT.tileClicked]: (state, {tileId}) => {
        const game = selectGame(state);

        const player = game.getPlayer(game);
        const playerTile = game.getEntityTileId(player);
        const tile = game.getTile(tileId);
        /*

        entity.Position.getTileId()
        entity.Health.getHealth()
        entity.Attack





        * */

        if (game.getEntityTileId(player))
        if (tile.isNext(player.tileId)) {
          return Rx.of((action$entityAbility(
            'MOVE'
            , player.id
            , tileId
            ))
          )
        } else {
          return Rx.NEVER;
        }
      }
    }
  }
}