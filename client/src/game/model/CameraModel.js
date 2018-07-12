import {Record} from 'immutable';

import Point from './Point';

import {CELLSIZE} from "../const.game";

export default class CameraModel extends Record({
  pos: new Point()
  , width: 10
  , height: 10
  , minX: 0
  , minY: 0
  , maxX: 0
  , maxY: 0
}) {
  getViewBox() {
    const x = this.pos.x * CELLSIZE;
    const y = this.pos.y * CELLSIZE;
    const width = this.width * CELLSIZE;
    const height = this.height * CELLSIZE;
    return `${x - width / 2} ${y - height / 2} ${width} ${height}`;
  }

  setTo(point) {
    const width2 = Math.ceil(this.width / 2);
    const height2 = Math.ceil(this.height / 2);
    return this
      .setIn(['pos', 'x'], point.x)
      .setIn(['pos', 'y'], point.y)
      .set('minX', point.x - width2)
      .set('maxX', point.x + width2)
      .set('minY', point.y - height2)
      .set('maxY', point.y + height2)
  }
}