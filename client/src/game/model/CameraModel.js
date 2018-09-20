import {Record} from 'immutable';

import Point from './Point';

import {CELLSIZE, getTileX, getTileY} from "../const.game";

export default class CameraModel extends Record({
  tileId: 0
  , width: 10
  , height: 10
  , minX: 0
  , minY: 0
  , maxX: 0
  , maxY: 0
}) {
  getViewBox() {
    const x = this.x * CELLSIZE;
    const y = this.y * CELLSIZE;
    const width = this.width * CELLSIZE;
    const height = this.height * CELLSIZE;
    return `0 0 ${width} ${height}`;
  }

  getOffset() {
    const x = this.x * CELLSIZE;
    const y = this.y * CELLSIZE;
    const width = this.width * CELLSIZE;
    const height = this.height * CELLSIZE;
    console.log(`translate(${x}px, ${y}px)`);
    return `translate(${-x + width / 2}px, ${-y + height / 2}px)`;
  }

  setTo(tileId) {
    const width2 = Math.ceil(this.width / 2);
    const height2 = Math.ceil(this.height / 2);
    const x = getTileX(tileId);
    const y = getTileY(tileId);
    return this.merge({
      tileId
      , minX: x - width2
      , maxX: x + width2
      , minY: y - height2
      , maxY: y + height2
    });
  }

  get x () {
    return getTileX(this.tileId);
  }

  get y () {
    return getTileY(this.tileId);
  }
}