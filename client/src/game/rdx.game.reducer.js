import _ from 'lodash';
import {Record, List, Map} from 'immutable';

import {createReducer, switchReducer} from '../util/redux.util';

import CONST_GAME from "./rdx.game._";
import CONST_INPUT from './input/rdx.input._';
import CONST_COMMAND from './const.commands';

import GameModel from './model/GameModel.js'
import PlayerModel from './model/PlayerModel.js'
import {ENTITY_ACTION, ENTITY_TRAIT, EntityTraits} from "./model/EntityModel";
import EntityModel from "./model/EntityModel";

const initialState = new GameModel();

export default createReducer(initialState, {
  [CONST_GAME.gameLoopStart]: (game) => game.set('running', true)
  , [CONST_GAME.gameLoopStop]: (game) => game.set('running', false)
  // , [CONST_GAME.playerMove]: (game, {x, y}) => game.update('player', player => player
  //   .update('x', x0 => x0 + x)
  //   .update('y', y0 => y0 + y)
  // ).update('queue', queue => queue.skip(1))
  , [CONST_GAME.loadLevelComplete]: (game, data) => game.parseLevel(data)
  , [CONST_GAME.gameSpawnPlayer]: (game, data) => {
    const spawnPoint = game.emap.find(entity => {
      return entity.getTrait(ENTITY_TRAIT.TraitPlayerSpawnPoint)
    });
    const player = EntityModel.fromJS({
      id: '@'
      , tileId: spawnPoint.tileId
    }).addTrait(EntityTraits.TraitPlayer);

    return game
      .set('player', player)
      .update('camera', camera => camera.setTo(spawnPoint.tileId))
  }
  , [CONST_GAME.entityAction]: switchReducer((game, data) => data.actionName
    , {
      [ENTITY_ACTION.MOVE]: (game, {actionName, entityId, tileId}) => {
        return game
          .setIn(['player', 'tileId'], tileId)
          .update('camera', camera => camera.setTo(tileId))
      }
      , [ENTITY_ACTION.INTERACT]: (game, {actionName, entityId, tileId}) => {
        return game.updateIn(['emap', entityId], entity)
      }
    }
  )
  // , [CONST_INPUT.inputIntent]: switchReducer((game, data) => data.commandName, {
  //   [CONST_COMMAND.UP]: COMMAND_MOVE(0, -1)
  //   , [CONST_COMMAND.DOWN]: COMMAND_MOVE(0, 1)
  //   , [CONST_COMMAND.LEFT]: COMMAND_MOVE(-1, 0)
  //   , [CONST_COMMAND.RIGHT]: COMMAND_MOVE(1, 0)
  // })
  // , [CONST_INPUT.levelTileClicked]: switchReducer((game, data) => {
  //   return game.getIn(['level', data.tileId, 'text']);
  // }, {
  //   ' ': (game, data) => {
  //     console.log('TILE ID', data.tileId);
  //     return game;
  //   }
  // })
});

// intent > validate > command > queue > validate > execute

// tile.elist = [1,2]
// game.emap
// 1: button#1
// 2: button#1
// trait button interact click
// trait