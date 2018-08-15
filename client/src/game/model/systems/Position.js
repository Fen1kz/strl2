import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';
import {System, SystemId} from '../ECS';

import CONST_INPUT from '../../input/rdx.input._';

export const Position = System.fromJS({
  id: SystemId.Position
  // , eventMap: {
  //   [CONST_INPUT.tileClicked]: ()
  //   [CONST_INPUT.entityClicked]: ()
  // }
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