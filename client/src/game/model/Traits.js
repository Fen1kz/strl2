import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from './TraitModel';
import {EntityData} from './EntityModel';

export const Trait = {
  [TraitId.Position]: TraitModel.fromJS({
    id: TraitId.Position
    , onAttach: (entity, tileId) => entity.setIn(['data', EntityData.TileId], tileId)
    , traitData: {
      getTileId
    }
  })
  , [TraitId.TraitPlayer]: TraitModel.fromJS({
    id: TraitId.TraitPlayer
    // , onAttach: (entity, tileId) => entity.setIn(['data', tileId], tileId)
    ,
  })
  , [TraitId.TraitWall]: TraitModel.fromJS({
    id: TraitId.TraitWall
    , onAttach: (entity, tileId) => entity.setIn(['data', tileId], tileId)
  })
  , [TraitId.TraitDoor]: TraitModel.fromJS({
    id: TraitId.TraitDoor
    // , onAttach: (entity, tileId) => entity.setIn(['data', tileId], tileId)
  })
};