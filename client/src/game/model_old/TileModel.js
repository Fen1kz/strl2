import Point from "./Point";
import {Record, List} from "immutable";
import {getTileX, getTileY} from '../const.game';

export default class TileModel extends Record({
  id: void 0
  , next: void 0
  , elist: List()
}) {

  static fromJS(js) {
    return new TileModel(js)
      .set('next', new TileNextModel(js.next))
      .set('elist', List(js.elist))
  }

  getEntityList(game) {
    return this.elist.map(eid => game.getEntity(eid))
  }

  isNext(tileId, strict) {
    return (
      this.next.N === tileId
      || this.next.E === tileId
      || this.next.S === tileId
      || this.next.W === tileId
      || (!strict && (
        this.next.NE === tileId
        || this.next.NW === tileId
        || this.next.SE === tileId
        || this.next.SW === tileId
      )));
  }

  get x () {
    return getTileX(this.id);
  }

  get y () {
    return getTileY(this.id);
  }
};

export const TileNextModel = Record({
  N: void 0, E: void 0, S: void 0, W: void 0
  , NE: void 0, NW: void 0, SE: void 0, SW: void 0
});