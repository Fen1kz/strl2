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
    .addTrait(TraitId.Energy, 0)
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
  onAttach(entity, {
    toOpen = 20
    , toClose = 20
    , closed = true
    , orientation = 0
  }) {
    let gfx = '?';
    if (closed) {
      gfx = orientation === 0 ? ']' : '[';
    } else {
      gfx = '|';
    }
    return entity
      .addTrait(TraitId.Impassable, closed)
      .addTrait(TraitId.Energy, 0)
      .addTrait(TraitId.TextGfx, gfx)
  }
  , getAction(game, entity) {
    console.log(this);
    return null;
    // if (this)
    // if (game.getEntityEnergy(entity.id))
  }
});

export default TraitData;