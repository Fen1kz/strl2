import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';

import CONST_INPUT from '../../input/rdx.input._';
import {getTileX, getTileY} from "../../const.game";

export function PositionSystem() {
  return {
    getEntityTileId(entityId) {
      return this.getEntity(entityId).data.get('tileId');
    }
    , getEntityXY(entityId) {
      const tileId = this.getEntityTileId(entityId);
      return {
        x: getTileX(tileId)
        , y: getTileY(tileId)
      }
    }
    , events: {
      onEntityAttach(game, entity) {
        const tileId = this.getEntityTileId(entity.id);
        return game
          .updateEntity(entity.id, entity => entity.setIn(['data', 'tileId'], tileId))
          .updateTile(tileId, tile => tile.update('elist', elist => elist.push(entity.id)));
      }
    }
  }
}