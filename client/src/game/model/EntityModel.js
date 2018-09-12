import _ from "lodash";
import {Record, Map, List} from "immutable";
import {updateViaReduce} from './Model.utils';

import {getTileId, getTileX, getTileY} from '../const.game';

import {TraitId} from './TraitModel';
import {Trait} from './Traits';

export const EntityData = {
  TileId: 'tileId'
  // , Passable: 'Passable'
};

export class EntityModel extends Record({
  id: null
  , traits: EntityTraits()
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
    return this.setIn(['traits', trait.id], trait.id)
      .update(entity => trait.onAttach(entity, ...params));
  }

  hasTrait(traitId) {
    return this.traits.has(traitId);
  }

  get x () {
    return getTileX(this.data.get('tileId'));
  }

  get y () {
    return getTileY(this.data.get('tileId'));
  }
}

export default EntityModel;