import _ from "lodash";
import {Record, Map, List} from "immutable";
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

  static fromSeed({xy, traits}) {
    let entity = (new EntityModel());
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
    const traitData = (data instanceof Object) ? Map(Object.assign({}, trait.defaultData, data))
      : data !== void 0 ? data
        : trait.defaultData;
    return this.setIn(['traits', traitId], traitData)
      .update(self => trait.onAttach(self, traitData))
      .update(self => {
        if (!trait.getAction) return self;
        return self.update('traitCommandHandlers', (list = List()) => list.push(trait.getAction));
      });
  }

  hasTrait(traitId) {
    return this.traits.has(traitId);
  }

  getTrait(traitId) {
    return this.traits.get(traitId);
  }

  getCommandsArray() {
    return this.traitCommandHandlers.toArray();
  }
}

export default EntityModel;