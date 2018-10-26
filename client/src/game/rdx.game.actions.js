import CONST_GAME from "./rdx.game._";

export const action$gameLoopStart = () => ({
  type: CONST_GAME.gameLoopStart
});

export const action$gameLoopContinue = () => ({
  type: CONST_GAME.gameLoopContinue
});

export const action$gameLoopApply = () => ({
  type: CONST_GAME.gameLoopApply
});

export const action$gameLoopEnergy = () => ({
  type: CONST_GAME.gameLoopEnergy
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

export const action$entityCommandRequestActions = (entityId) => ({
  type: CONST_GAME.entityCommandRequestActions
  , data: {entityId}
});

export const action$entityCommandGetResult = (command) => ({
  type: CONST_GAME.entityCommandGetResult
  , data: {command}
});

export const action$entityCommandScheduleEffect = (command) => ({
  type: CONST_GAME.entityCommandScheduleEffect
  , data: {command}
});

export const action$entityApplyEffect = (effect) => ({
  type: CONST_GAME.entityApplyEffect
  , data: {effect}
});

export const action$entityCommandApplyEffect = (command) => ({
  type: CONST_GAME.entityCommandApplyEffect
  , data: {command}
});

export const action$entityCommandApplyEffects = () => ({
  type: CONST_GAME.entityCommandApplyEffects
});

/*
* Player
* */

export const action$entityCommand = (command) => ({
  type: CONST_GAME.entityCommand
  , data: command
});

export const action$playerQueueShift = () => ({
  type: CONST_GAME.playerQueueShift
});

export const action$playerQueueClear = () => ({
  type: CONST_GAME.playerQueueClear
});

export const action$playerModeChange = (modeId, commandFn) => ({
  type: CONST_GAME.playerModeChange
  , data: {modeId, commandFn}
});

export const action$playerCursorMove = (tileId) => ({
  type: CONST_GAME.playerCursorMove
  , data: {tileId}
});
