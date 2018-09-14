import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import {mixSystems} from "./Model.utils";
import {LoopSystem} from 'systems/LoopSystem';
import {PositionSystem} from 'systems/PositionSystem';
import {PlayerSystem} from 'systems/PlayerSystem';
import {EntitySystem} from 'systems/EntitySystem';
import {LevelSystem} from 'systems/LevelSystem';


export const CoreSystem = () => ({

});

export const GameModelProps = mixSystems(
  CoreSystem()
  , LevelSystem()
  , EntitySystem()
  , PositionSystem()
  , PlayerSystem()
  , LoopSystem()
);

export class GameModel extends Record(GameModelProps) {
}

export const createGameModel = () => (new GameModel());