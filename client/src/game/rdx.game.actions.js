import CONST_GAME from "./rdx.game._";

export const action$gameLoopStart = () => ({
  type: CONST_GAME.gameLoopStart
});

export const action$gameLoopStop = () => ({
  type: CONST_GAME.gameLoopStop
});

export const action$setGameRunning = (value) => ({
  type: CONST_GAME.setGameRunning
  , payload: value
});

export const action$playerMove = (x, y) => ({
  type: CONST_GAME.playerMove
  , payload: {x, y}
});