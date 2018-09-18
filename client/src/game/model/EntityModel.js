import _ from "lodash";
import {Record, Map, List} from "immutable";
import {updateViaReduce} from './Model.utils';

import {getTileId, getTileX, getTileY} from '../const.game';

import TraitId from './traits/TraitId';
import TraitData from './traits/TraitData';

export class EntityModel extends Record({
  id: null
  , traits: Map()
}) {
  static fromJS(js) {
    return new EntityModel(js);
  }

  static fromSeed({xy, traits}) {
    let entity = (new EntityModel());
    if (xy) {
      const tileId = getTileId(xy[0], xy[1]);
      entity = entity.addTrait(TraitId.Position, tileId)
    }
    return entity.update(updateViaReduce(traits, (entity, traitData, traitId) => {
      return entity.addTrait(traitId, traitData);
    }))
  }

  addTrait(traitId, traitData) {
    const trait = TraitData[traitId];
    if (!trait) throw new Error(`No trait[${traitId}]`);
    return this.setIn(['traits', traitId], traitData)
      .update(self => trait.onAttach(self, traitData));
  }

  hasTrait(traitId) {
    return this.traits.has(traitId);
  }

  getTrait(traitId) {
    return this.traits.get(traitId);
  }
}

export default EntityModel;