import _ from 'lodash';
import {Record, List} from 'immutable';

import PlayerModel from './PlayerModel.js';

class GameModel extends Record({
  queue: List()
  , running: false
  , player: new PlayerModel()
  , level: null
}) {
  isValid() {
    return !!(this.level && this.player);
  }
}

export default GameModel;
