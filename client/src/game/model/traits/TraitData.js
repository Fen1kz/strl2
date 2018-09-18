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
    .addTrait(TraitId.TextGfx, '@')
});

createTraitData(TraitId.Impassable, {
  // onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.Interactive, {
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
  onAttach: (entity, traitData) => entity
    .addTrait(TraitId.Impassable, traitData)
    .addTrait(TraitId.TextGfx, traitData ? ']' : '[')
    .addTrait(TraitId.Interactive, {})
});

export default TraitData;