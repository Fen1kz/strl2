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
  , getAction(game, entity) {
    return true;
  }
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
  defaultData: {
    toOpen: 20
    , toClose: 20
    , closed: true
    , orientation: 0
  }
  , onAttach(entity, traitData) {
    let gfx = '?';
    if (traitData.get('closed')) {
      gfx = traitData.get('orientation') === 0 ? ']' : '[';
    } else {
      gfx = '|';
    }
    return entity
      .addTrait(TraitId.Impassable, closed)
      .addTrait(TraitId.Energy, 0)
      .addTrait(TraitId.TextGfx, gfx)
  }
  , getAction(game, entity) {
    const trait = entity.getIn(['traits', TraitId.AutoDoor]);
    if (trait.get('closed')) {
      return {
        type: 'OPEN'
        , cost: trait.get('toOpen')
        , sourceId: entity.id
      }
    } else {
      return {
        type: 'CLOSE'
        , cost: trait.get('toClose')
        , sourceId: entity.id
      }
    }
  }
});

export default TraitData;