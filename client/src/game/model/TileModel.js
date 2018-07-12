import Point from "./Point";
import {Record} from "immutable";

export default class TileModel extends Record({
  id: void 0, pos: new Point(), text: void 0, next: void 0
}) {
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
};

export const TileNextModel = Record({
  N: void 0, E: void 0, S: void 0, W: void 0
  , NE: void 0, NW: void 0, SE: void 0, SW: void 0
});

export const TraitPassable = {
  passable: true
};