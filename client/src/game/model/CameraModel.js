import {Record} from 'immutable';

import Point from './Point';

import {CELLSIZE} from "../const.game";

export default class CameraModel extends Record({
  pos: new Point()
  , width: 10
  , height: 10
}) {
  getViewBox() {
    const x = this.pos.x * CELLSIZE;
    const y = this.pos.y * CELLSIZE;
    const width = this.width * CELLSIZE;
    const height = this.height * CELLSIZE;
    return `${x - width / 2} ${y - height / 2} ${width} ${height}`;
  }
}