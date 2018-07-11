import inputConstants from './rdx.input._';

export const keyDown = (keyCode) => ({
  type: inputConstants.keyDown,
  data: keyCode
});

export const keyUp = (keyCode) => ({
  type: inputConstants.keyUp,
  data: keyCode
});

export const makeCommand = (command) => ({
  type: inputConstants.command$ + command,
  data: null
});