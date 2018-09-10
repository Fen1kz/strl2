import _ from "lodash";
import {Record, Map, List} from "immutable";
import {updateViaReduce} from './Model.utils';

import {getTileId} from '../const.game';

import {TraitId} from './TraitModel';
import {Trait} from './Traits';

export const STAT = {
  Impassable: 'Impassable'
};

export class EntityModel extends Record({
  id: null
  , data: Map()
}) {
  static fromJS(js) {
    return new EntityModel(js);
  }

  static fromSeed({xy, traits}) {
    let entity = (new EntityModel());
    if (xy) {
      const tileId = getTileId(xy[0], xy[1]);
      entity = entity.addTrait(Trait[TraitId.Position], tileId)
    }
    return entity.update(updateViaReduce(traits, (entity, traitId) => {
      return entity.addTrait(Trait[traitId]);
    }))
  }

  addTrait(trait, ...params) {
    return trait.onAttach(this, ...params);
  }
}

export default EntityModel;