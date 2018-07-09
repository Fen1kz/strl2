import _ from 'lodash';
import {createReducer} from '../../util/redux.util';

import {Key} from '../../util/Keyboard';
import Commands from '../const.commands';

const key2command = {
  [Key.W]: Commands.UP
  , [Key.A]: Commands.LEFT
  , [Key.S]: Commands.DOWN
  , [Key.D]: Commands.RIGHT
};

const initialState = _.mapValues(Commands, () => false);

export default createReducer(initialState, {
  setInput: (state, {inputName, value}) => Object.assign({}, state, {[inputName]: value})
});