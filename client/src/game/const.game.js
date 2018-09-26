export const CELLSIZE2 = 10;
export const CELLSIZE = CELLSIZE2 * 2;
export const LEVEL_WIDTH = 32;
export const LEVEL_HEIGHT = 32;

// export const getTileX = (tileId) => Math.floor(tileId / LEVEL_WIDTH);
// export const getTileY = (tileId) => tileId % LEVEL_HEIGHT;
// export const getTileId = (x, y) => x * LEVEL_WIDTH + y;

export const getTileY = (tileId) => Math.floor(tileId / LEVEL_WIDTH);
export const getTileX = (tileId) => tileId % LEVEL_HEIGHT;
export const getTileId = (x, y) => {
  const id = x + y * LEVEL_HEIGHT;
  return (id >= 0 ? id : null);
};
export const getTileIdOffset = (tileId, x, y) => {
  return getTileId(getTileX(tileId) + x, getTileY(tileId) + y);
};

export const translateXY = (point) => `${point.x * CELLSIZE}px, ${point.y * CELLSIZE}px`;