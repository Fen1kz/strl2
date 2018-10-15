import _ from 'lodash';
import {Record, List, Map} from 'immutable';

import {createReducer} from '../util/redux.util';

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from './input/rdx.input._';

import {createGameModel} from './model/GameModel';
import {parseLevel} from './model/GameModel.level-parsing';
import {PlayerSystem} from './model/systems/PlayerSystem';
import TraitId from './model/traits/TraitId';
import {action$gameLoopExecute} from "./rdx.game.actions";
import CommandData, {CommandTargetType} from "./model/commands/CommandData";
import {updateViaReduce} from "./model/Model.utils";
import {applyCommandEffect} from "./model/commands/Command.utils";
// import PlayerModel from './model/PlayerModel.js'
// import {ABILITY, ABILITY_TARGET_TYPE, ENTITY_TRAIT, TRAIT_TYPE} from "./model/EntityModel";
// import EntityModel from "./model/EntityModel";

const initialState = createGameModel();

export default createReducer(initialState, {
  [CONST_GAME.gameLoopStart]: (game, data) => game.set('running', true)
  // , [CONST_GAME.gameLoopContinue]: (game) => {
  //   return game
  //     .update(updateViaReduce(game.scheduledEffects, applyCommandEffect))
  //     .set('scheduledEffects', List())
  // }
  , [CONST_GAME.gameLoopEnergy]: (game) => {
    return game.update(updateViaReduce(game.actors, (game, energy, actorId) => {
      return game.updateEntityEnergy(actorId, energy => energy + 5);
    }));
  }
  , [CONST_GAME.loadLevelComplete]: (game, data) => game
    .merge(parseLevel(data))
  , [CONST_GAME.entityCommandScheduleEffect]: (game, {command}) => {
    return game
      .update('scheduledEffects', list => list.push(command));
  }
}, (state, action) => state.onEvent(action.type, action.data));