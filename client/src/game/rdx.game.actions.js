import CONST_GAME from "./rdx.game._";

export const action$gameLoopStart = () => ({
  type: CONST_GAME.gameLoopStart
});

export const action$gameLoopStop = () => ({
  type: CONST_GAME.gameLoopStop
});

export const action$loadGameViewComplete = () => ({
  type: CONST_GAME.loadGameViewComplete
});

export const action$loadLevelComplete = (data) => ({
  type: CONST_GAME.loadLevelComplete
  , data
});

export const action$gameSpawnPlayer = () => ({
  type: CONST_GAME.gameSpawnPlayer
});

export const action$gameEvent = (event) => ({
  type: CONST_GAME.gameEvent
  , data: {eventType: event.type, data: event.data}
});

export const action$entityCommand = (command) => ({
  type: CONST_GAME.entityCommand
  , data: {command}
});
