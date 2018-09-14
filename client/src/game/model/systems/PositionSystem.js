import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';

import CONST_INPUT from '../../input/rdx.input._';
import {getTileX, getTileY} from "../../const.game";

export function PositionSystem() {
  return {
    getEntityTileId(entity) {
      return entity.data.get('tileId');
    }
    , getEntityXY(entity) {
      const tileId = this.getEntityTileId(entity);
      return {
        x: getTileX(entity.data.get('tileId'))
        , y: getTileY(entity.data.get('tileId'))
      }
    }
    , events: {
      onEntityAttach(game, entity) {
        const tileId = this.getEntityTileId(entity);
        return game
          .updateEntity(entity.id, entity => entity.setIn(['data', 'tileId'], tileId))
          .updateTile(tileId, tile => tile.update('elist', elist => elist.push(entity.id)));
      }
    }
  }
}