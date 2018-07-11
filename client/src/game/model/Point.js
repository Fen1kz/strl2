import {Record} from "immutable";

export default class Point extends Record({
  x: 0, y: 0
}) {
  setTo(point) {
    return this.set('x', point.x).set('y', point.y);
  }
};