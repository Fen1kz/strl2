import _ from 'lodash';
import {Record, List, Map} from 'immutable';

import {createReducer, switchReducer} from '../util/redux.util';

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from './input/rdx.input._';
import CONST_COMMAND from './const.commands';

import {createGameModel} from './model/GameModel';
import {parseLevel} from './model/GameModel.level-parsing';
import {PlayerSystem} from './model/systems/PlayerSystem';
import TraitId from './model/traits/TraitId';
import {action$gameLoopExecute} from "./rdx.game.actions";
import CommandData from "./model/commands/CommandData";
// import PlayerModel from './model/PlayerModel.js'
// import {ABILITY, ABILITY_TARGET_TYPE, ENTITY_TRAIT, TRAIT_TYPE} from "./model/EntityModel";
// import EntityModel from "./model/EntityModel";

const initialState = createGameModel();

export default createReducer(initialState, {
  [CONST_GAME.gameLoopStart]: (game, data) => game.onEvent(CONST_GAME.gameLoopStart, data)
  , [CONST_GAME.gameLoopContinue]: (game, data) => game.onEvent(CONST_GAME.gameLoopContinue, data)
  , [CONST_GAME.gameLoopWaitPlayer]: (game, data) => game.onEvent(CONST_GAME.gameLoopWaitPlayer, data)
  , [CONST_GAME.gameLoopExecute]: (game, data) => game.onEvent(CONST_GAME.gameLoopExecute, data)
  // , [CONST_GAME.gameLoopStop]: (game) => game.set('running', false)
  // // , [CONST_GAME.playerMove]: (game, {x, y}) => game.update('player', player => player
  // //   .update('x', x0 => x0 + x)
  // //   .update('y', y0 => y0 + y)
  // // ).update('queue', queue => queue.skip(1))
  , [CONST_GAME.loadLevelComplete]: (game, data) => game
    .merge(parseLevel(data))
  // , [CONST_GAME.gameEvent]: (game, data) => {
  //   game.
  // }
  // , [CONST_GAME.gameSpawnPlayer]: (game, data) => {
  // const spawnPoint = game.emap.find(entity => {
  //   return entity.getTrait(TraitId.TraitPlayer)
  // });
  // const player = EntityModel.fromJS({
  //   id: '@'
  //   , tileId: spawnPoint.tileId
  // }).addTrait(ENTITY_TRAIT.TraitPlayer);

  // return game
  //   // .setIn(['emap', player.id], player)
  //   .update('camera', camera => camera.setTo(spawnPoint.tileId))
  // }
  , [CONST_GAME.playerCommand]: (game, data) => game.onEvent(CONST_GAME.playerCommand, data)
  // , [CONST_GAME.entityCommandRequestActions]: (game, data) => game.onEvent(CONST_GAME.playerCommand, data)
  , [CONST_GAME.entityCommandGetResult]: (game, data) => game.onEvent(CONST_GAME.entityCommandGetResult, data)
  // , [CONST_GAME.entityCommandApplyEffect]: (game, data) => game.onEvent(CONST_GAME.entityCommandApplyEffect, data)
  , [CONST_GAME.entityCommandCheck]: (game, {command}) => {
    const commandData = CommandData[command.id];
    const commandResult = commandData.effect(game, command);
    if (commandResult === false) {
      return game;
    }
    return commandResult
      .updateEntity(command.sourceId, entity => entity.updateIn(['traits', TraitId.Energy], energy => energy - command.cost))
  }
  // , [CONST_GAME.entityCommand]: (game, {traitType, abilityId, sourceId, targetId}) => {
  //   const et = ENTITY_TRAIT;
  //   const ability = ABILITY[abilityId];
  //   const source = game.getEntity(sourceId);
  //   let target = null;
  //   if (ability.targetType === ABILITY_TARGET_TYPE.TILE) {
  //     target = game.getTile(targetId);
  //   } else if (ability.targetType === ABILITY_TARGET_TYPE.ENTITY) {
  //     target = game.getEntity(targetId);
  //   }
  //   return ability.execute(game, source, target)
  // }
  // // , [CONST_GAME.entityCommand]: switchReducer((game, data) => data.actionName
  // //   , {
  // //     [ABILITY.MOVE]: (game, {actionName, entityId, tileId}) => {
  // //       return game
  // //         .setIn(['player', 'tileId'], tileId)
  // //         .update('camera', camera => camera.setTo(tileId))
  // //     }
  // //     , [ABILITY.INTERACT]: (game, {actionName, entityId, tileId}) => {
  // //       return game.updateIn(['emap', entityId], entity)
  // //     }
  // //   }
  // // )
  // // , [CONST_INPUT.inputIntent]: switchReducer((game, data) => data.commandName, {
  // //   [CONST_COMMAND.UP]: COMMAND_MOVE(0, -1)
  // //   , [CONST_COMMAND.DOWN]: COMMAND_MOVE(0, 1)
  // //   , [CONST_COMMAND.LEFT]: COMMAND_MOVE(-1, 0)
  // //   , [CONST_COMMAND.RIGHT]: COMMAND_MOVE(1, 0)
  // // })
  // // , [CONST_INPUT.levelTileClicked]: switchReducer((game, data) => {
  // //   return game.getIn(['level', data.tileId, 'text']);
  // // }, {
  // //   ' ': (game, data) => {
  // //     console.log('TILE ID', data.tileId);
  // //     return game;
  // //   }
  // // })
});

// intent > validate > command > queue > validate > execute

// tile.elist = [1,2]
// game.emap
// 1: button#1
// 2: button#1
// trait button interact click
// trait