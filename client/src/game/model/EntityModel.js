import _ from "lodash";
import {Record, Map, List, fromJS} from "immutable";
import {updateViaReduce} from './Model.utils';

import {getTileId, getTileX, getTileY} from '../const.game';

import TraitId from './traits/TraitId';
import TraitData from './traits/TraitData';

export class EntityModel extends Record({
  id: null
  , traits: Map()

  , traitCommandHandlers: void 0
}) {
  static fromJS(js) {
    return new EntityModel(js);
  }

  static fromSeed({id, xy, traits}) {
    let entity = new EntityModel({id});
    if (xy) {
      const tileId = getTileId(xy[0], xy[1]);
      entity = entity.addTrait(TraitId.Position, tileId)
    }
    return entity.update(updateViaReduce(_.entries(traits), (entity, [traitId, traitData]) => {
      return entity.addTrait(traitId, traitData);
    }))
  }

  addTrait(traitId, data) {
    const trait = TraitData[traitId];
    if (!trait) throw new Error(`No trait[${traitId}]`);
    const traitData = (data instanceof Object) ? fromJS(Object.assign({}, trait.defaultData, data))
      : data !== void 0 ? data
        : trait.defaultData;
    return this.setIn(['traits', traitId], traitData)
      .update(self => trait.onAttach(self, traitData))
      .update(self => {
        if (!trait.requestCommand) return self;
        return self.update('traitCommandHandlers', (list = List()) => list.push(trait.requestCommand));
      });
  }

  hasTrait(traitId) {
    return this.traits.has(traitId);
  }

  getTrait(traitId) {
    return this.traits.get(traitId);
  }

  requestCommandFromTraits(game) {
    return this.traitCommandHandlers.toArray()
      .map(handler => handler(game, this));
  }
}

export default EntityModel;