import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';
import {SystemModel, SystemId} from './SystemModel';

import CONST_INPUT from '../../input/rdx.input._';

export const Position = SystemModel.fromJS({
  id: SystemId.Position
  // , onAttach() {
  // }
  , onEntityAttach(entity) {
    entity.data.tileId
    return this;
  }
  , onUpdate() {
    console.log('position update')
  }
});