import _ from "lodash";
import {Record, Map, List} from "immutable";
import TraitId from './TraitId'
import TraitModel from '../TraitModel';

const TraitData = {};

const createTraitData = (traitId, traitData) => (
  TraitData[traitId] = TraitModel.fromJS(Object.assign({}
    , {id: traitId}
    , traitData))
);

createTraitData(TraitId.Position, {
  onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.Player, {
  onAttach: (entity) => entity
    .addTrait(TraitId.Impassable, true)
    .addTrait(TraitId.Energy)
    .addTrait(TraitId.TextGfx, '@')
});

createTraitData(TraitId.Impassable, {
  // onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.Interactive, {
  // onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.Energy, {
  // onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.TextGfx, {
  onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.Door, {
  onAttach: (entity, traitData) => entity
    .addTrait(TraitId.Impassable, traitData)
    .addTrait(TraitId.TextGfx, traitData ? '+' : '-')
    .addTrait(TraitId.Interactive, {})
});

createTraitData(TraitId.AutoDoor, {
  onAttach: (entity, {
    periodOpen = 2
    , periodTransition = 2
    , periodClose = 2
    , state = 0
    , orientation = 0
  }) => {
    let closed = state > periodOpen;
    let gfx = '?';
    if (closed) {
      gfx = orientation === 0 ? ']' : '[';
    } else {
      gfx = '|'
    }
    return entity
      .addTrait(TraitId.Impassable, closed)
      .addTrait(TraitId.Energy)
      .addTrait(TraitId.TextGfx, gfx)
      .addTrait(TraitId.Interactive, {})
  }
});

export default TraitData;