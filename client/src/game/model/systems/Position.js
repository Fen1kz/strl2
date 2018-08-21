import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';
import {SystemModel, SystemId} from './SystemModel';

import CONST_INPUT from '../../input/rdx.input._';

export const Position = SystemModel.fromJS({
  id: SystemId.Position
  , data: List()
  , onAttach() {
  }
  , onEntityAttach(entity) {
    if (entity.traits.has(TraitId.Position)) {
      return this.update('elist', elist => elist.push(entity.id));
    }
    return this;
  }
  , onUpdate() {
    console.log('position update')
  }
});