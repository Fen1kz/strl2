import CONST_INPUT from './rdx.input._';

export const action$inputPlayer = (inputCommand, interval) => ({
  type: CONST_INPUT.inputPlayer
  , data: {inputCommand, interval}
});

export const action$entityClicked = (entityId, tileId) => ({
  type: CONST_INPUT.entityClicked
  , data: {entityId, tileId}
});

export const action$tileClicked = (tileId) => ({
  type: CONST_INPUT.tileClicked
  , data: {tileId}
});