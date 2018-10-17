import _ from "lodash";
import {Record, Map, List, fromJS, Iterable} from "immutable";
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
    const traitData = TraitData[traitId];
    if (!traitData) throw new Error(`No TraitData[${traitId}]`);
    let traitValue;
    if (Iterable.isIterable(data)) {
      traitValue = data;
    } else if (data instanceof Object) {
      traitValue = fromJS(Object.assign({}, traitData.defaultData, data));
    } else {
      traitValue = data !== void 0 ? data : traitData.defaultData;
    }
    return this.setIn(['traits', traitId], traitValue)
      .update(self => traitData.onAttach(self, traitValue))
      .update(self => {
        if (!traitData.requestCommand) return self;
        return self.update('traitCommandHandlers', (list = List()) => list.push(traitData.requestCommand));
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