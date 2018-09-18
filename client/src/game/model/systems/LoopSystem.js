import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";

import CONST_GAME from '../../rdx.game._';

export function LoopSystem() {
  return {
    running: false
    , queue: List()
    , events: {
      [CONST_GAME.entityCommand]({command}) {
        console.log('Command', command);
        return this.update('queue', queue => queue.push(command));
      }
      , [CONST_GAME.gameLoopStart]() {
        return this.set('running', true);
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart](state) {
        return Rx.NEVER;
      }
    }
  }
}