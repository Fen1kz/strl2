import _ from "lodash";
import {Record, Map, List} from "immutable";
import {updateViaReduce} from './Model.utils';

import {getTileId, getTileX, getTileY} from '../const.game';

import {TraitId} from './TraitModel';
import {TraitData} from './TraitData';

export const EntityData = {
  TileId: 'tileId'
  // , Passable: 'Passable'
};

export class EntityModel extends Record({
  id: null
  , data: Map()
  , traits: Map()
}) {
  static fromJS(js) {
    return new EntityModel(js);
  }

  static fromSeed({xy, traits}) {
    let entity = (new EntityModel());
    if (xy) {
      const tileId = getTileId(xy[0], xy[1]);
      entity = entity.addTrait(TraitData[TraitId.TraitPosition], tileId)
    }
    return entity.update(updateViaReduce(traits, (entity, traitId) => {
      const trait = TraitData[traitId];
      if (!trait) throw new Error(`No trait[${traitId}]`);
      return entity.addTrait(trait);
    }))
  }

  addTrait(trait, ...params) {
    return this.setIn(['traits', trait.id], trait.id)
      .update(entity => trait.onAttach(entity, ...params));
  }

  hasTrait(traitId) {
    return this.traits.has(traitId);
  }
}

export default EntityModel;