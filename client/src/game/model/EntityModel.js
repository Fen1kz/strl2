import _ from "lodash";
import {Record, Map, List} from "immutable";
import {updateViaReduce} from './Model.utils';

import {getTileId} from '../const.game';

import {TraitId} from './TraitModel';
import {Trait} from './Traits';

export const EntityData = {
  TileId: 'tileId'
  // , Passable: 'Passable'
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
      const trait = Trait[traitId];
      if (!trait) throw new Error(`No trait[${traitId}]`);
      return entity.addTrait(trait);
    }))
  }

  addTrait(trait, ...params) {
    return trait.onAttach(this, ...params);
  }
}

export default EntityModel;