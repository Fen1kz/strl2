import inputConstants from './rdx.input._';

export const keyDown = (keyCode) => ({
  type: inputConstants.keyDown,
  payload: keyCode
});

export const keyUp = (keyCode) => ({
  type: inputConstants.keyUp,
  payload: keyCode
});

export const makeCommand = (command) => ({
  type: inputConstants.command$ + command,
  payload: null
});