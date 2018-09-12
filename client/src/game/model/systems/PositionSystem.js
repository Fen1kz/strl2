import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';
import {SystemModelProps, SystemModel, SystemId} from './SystemModel';

import CONST_INPUT from '../../input/rdx.input._';
import {getTileX, getTileY} from "../../const.game";

export class PositionSystemModel extends Record({
  ...SystemModelProps
  , id: SystemId.Position
}) {
  onEntityAttach(game) {
    console.log('oea')
    return game;
  }

  getEntityXY(entity) {
    const tileId = entity.data.get('tileId');
    return {
      x: getTileX(entity.data.get('tileId'))
      , y: getTileY(entity.data.get('tileId'))
    }
  }
}

export const PositionSystem = new PositionSystemModel();