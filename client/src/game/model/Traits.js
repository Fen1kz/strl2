import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from './TraitModel';

export const Trait = {
  [TraitId.Position]: TraitModel.fromJS({
    id: TraitId.Position
    , onAttach: (entity, tileId) => entity.setIn(['data', tileId], tileId)
  })
  , [TraitId.TraitPlayer]: TraitModel.fromJS({
    id: TraitId.TraitPlayer
    // , onAttach: (entity, tileId) => entity.setIn(['data', tileId], tileId)
    ,
  })
};