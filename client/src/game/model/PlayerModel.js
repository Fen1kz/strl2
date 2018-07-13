import _ from 'lodash';
import {Record} from 'immutable';
import Point from './Point';
import {getTileX, getTileY} from "../const.game";

export class PlayerModel extends Record({
  tileId: void 0
}) {

  get x () {
    return getTileX(this.tileId);
  }

  get y () {
    return getTileY(this.tileId);
  }
}

export default PlayerModel;
