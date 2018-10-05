import _ from 'lodash';
import {Record, List, Map} from 'immutable';
import {updateViaReduce} from './Model.utils';

import Point from './Point.js';
import CameraModel from './CameraModel.js';

import TileModel, {TileNextModel} from './TileModel.js';
import {EntityModel} from './EntityModel.js';
import {TraitModel} from './TraitModel.js';
import TraitId from './traits/TraitId.js';

import {getTileId, getTileX, getTileY} from "../const.game";
import {createGameModel} from "./GameModel";


export const parseLevel = (data) => {
  let TILE_ID_COUNTER = 0;
  const tiles = [];
  let elist = data.entites || [];
  const text2trait = {
    '#': {
      [TraitId.Impassable]: true
      , [TraitId.GfxText]: '#'
    }
    , '@': {
      [TraitId.Impassable]: true
      , [TraitId.Player]: true
    }
    , '+': {
      [TraitId.DoorInteractive]: true
    }
    , 'O': {
      [TraitId.Crate]: {}
    }
    , 't': {
      [TraitId.MnstrTargetDummy]: null
    }
    , 'z': {
      [TraitId.MnstrZombie]: null
    }
  };

  const map = data.map.split('\n')
    .filter(row => row.trim())
    .map((row, y) => row.substr(2).split('')
      .map((text, x) => {
        const tileId = TILE_ID_COUNTER++;
        const tile = {id: tileId, elist: []};
        tiles.push(tile);
        if (text2trait[text]) elist.push({
          xy: [x, y]
          , traits: text2trait[text]
        });
        return tile;
      }));

  tiles.forEach((tile) => {
    // @formatter:off
    const x = getTileX(tile.id);
    const y = getTileY(tile.id);
    tile.next = {
      N: getTileId(x, y - 1)
      , E: getTileId(x + 1, y)
      , S: getTileId(x, y + 1)
      , W: getTileId(x - 1, y)
      , NE: getTileId(x + 1, y - 1)
      , NW: getTileId(x - 1, y - 1)
      , SE: getTileId(x + 1, y + 1)
      , SW: getTileId(x - 1, y + 1)
    };
    // @formatter:on
  });

  const game = createGameModel();

  return game
    .set('tiles', List(tiles).map(tile => TileModel.fromJS(tile)))
    .update(updateViaReduce(elist, (game, entitySeed) => {
      return game.addEntity(EntityModel.fromSeed(entitySeed))
    }));
};