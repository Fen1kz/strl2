import CONST_INPUT from './rdx.input._';

export const action$inputIntent = (commandName, data) => ({
  type: CONST_INPUT.inputIntent,
  data: {commandName, data}
});

export const action$inputCommand = (commandName, data) => ({
  type: CONST_INPUT.inputCommand,
  data: {commandName, data}
});

export const action$levelTileClicked = (tileId) => ({
  type: CONST_INPUT.levelTileClicked
  , data: {tileId}
});