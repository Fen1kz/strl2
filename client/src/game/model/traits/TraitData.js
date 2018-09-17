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
  onAttach: (entity, traitData) => entity.set(TraitId.Position, traitData)
});

createTraitData(TraitId.Player, {
  onAttach: (entity) => entity
    .set(TraitId.Player, true)
    .addTrait(TraitId.Impassable, true)
});

createTraitData(TraitId.Impassable, {
  onAttach: (entity, traitData) => entity
    .set(TraitId.Impassable, traitData)
});

createTraitData(TraitId.Impassable, {
  onAttach: (entity, traitData) => entity
    .set(TraitId.Impassable, traitData)
});

createTraitData(TraitId.TextGfx, {
  onAttach: (entity, traitData) => entity
    .set(TraitId.TextGfx, traitData)
});

createTraitData(TraitId.Door, {
  onAttach: (entity, traitData) => entity
    .addTrait(TraitId.Impassable, traitData)
    .addTrait(TraitId.TextGfx, traitData ? '+' : '-')
    .addTrait(TraitId.Interactive, {})
});

export default TraitData;