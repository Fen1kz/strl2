import _ from "lodash";
import {Record, Map, List} from "immutable";
import TraitModel from '../TraitModel';
import TraitId from '../traits/TraitId';

import CONST_INPUT from '../../input/rdx.input._';
import {getTileX, getTileY} from "../../const.game";

export function PositionSystem() {
  return {
    getEntityTileId(entityId) {
      return this.getEntity(entityId).traits.get(TraitId.Position);
    }
    , getEntityXY(entityId) {
      const tileId = this.getEntityTileId(entityId);
      return {
        x: getTileX(tileId)
        , y: getTileY(tileId)
      }
    }
    , events: {
      onEntityAttach(entity) {
        const tileId = this.getEntityTileId(entity.id);
        return this
          .updateTile(tileId, tile => tile.update('elist', elist => elist.push(entity.id)));
      }
    }
  }
}