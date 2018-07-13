export const CELLSIZE2 = 10;
export const CELLSIZE = CELLSIZE2 * 2;
export const LEVEL_WIDTH = 31;
export const LEVEL_HEIGHT = 31;

// export const getTileX = (tileId) => Math.floor(tileId / LEVEL_WIDTH);
// export const getTileY = (tileId) => tileId % LEVEL_HEIGHT;
// export const getTileId = (x, y) => x * LEVEL_WIDTH + y;

export const getTileY = (tileId) => Math.floor(tileId / LEVEL_WIDTH);
export const getTileX = (tileId) => tileId % LEVEL_HEIGHT;
export const getTileId = (x, y) => x + y * LEVEL_HEIGHT;
