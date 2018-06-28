export const RADIUS = 10;
export const CELLSIZE = 30;
export const SVG_WIDTH = 300;
export const SVG_HEIGHT = 300;

export const int2global = (xy) => xy * CELLSIZE + CELLSIZE * .5;
export const global2int = (xy) => Math.round(xy / CELLSIZE);
export const global2intFloor = (xy) => Math.floor(xy / CELLSIZE);
