import _ from "lodash";
import {Record, Map, List} from "immutable";
import TraitId from './TraitId'
import TraitModel from '../TraitModel';
import CommandData from "../commands/CommandData";
import CommandId from "../commands/CommandId";

const TraitData = {
  getTrait(traitId) {
    return this[traitId];
  }
};

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
    .addTrait(TraitId.GfxText, '@')
    .addTrait(TraitId.AbilityInteract, null)
    .addTrait(TraitId.StatStrength, null)
  , requestCommand(game, entity) {
    return TraitId.Player;
  }
});

createTraitData(TraitId.Impassable, {
  // onAttach: (entity, traitData) => entity
  // commandResult: {
  //   [CommandId.MOVE]: (game, {targetId}) => {}
  // }
});

createTraitData(TraitId.AbilityInteract, {
});

createTraitData(TraitId.Interactive, {
  // onAttach: (entity, traitData) => entity
  defaultData: null
});

createTraitData(TraitId.Energy, {
  // onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.GfxText, {
});

createTraitData(TraitId.GfxRequestText, {
});

createTraitData(TraitId.Door, {
  onAttach: (entity, traitData) => entity
    .addTrait(TraitId.Impassable, traitData)
    .addTrait(TraitId.GfxRequestText, TraitId.Door)
  , getGfx: (entity) => entity.getTrait(TraitId.Impassable) ? '+' : '-'
});

createTraitData(TraitId.DoorInteractive, {
  onAttach: (entity, traitData) => entity
    .addTrait(TraitId.Door, traitData)
    .addTrait(TraitId.Interactive, CommandId.SWITCH)
});

createTraitData(TraitId.AutoDoor, {
  defaultData: {
    toOpen: 40
    , toClose: 40
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
      .addTrait(TraitId.Impassable, traitData.get('closed'))
      .addTrait(TraitId.Energy, 0)
      .addTrait(TraitId.GfxRequestText, TraitId.AutoDoor)
  }
  , getGfx(entity) {
    const traitAutoDoor = entity.getTrait(TraitId.AutoDoor);
    const traitImpassable = entity.getTrait(TraitId.Impassable);
    if (traitImpassable) {
      return traitAutoDoor.get('orientation') === 0 ? ']' : '[';
    } else {
      return '|';
    }
  }
  , requestCommand(game, entity) {
    const traitAutoDoor = entity.getTrait(TraitId.AutoDoor);
    const traitImpassable = entity.getTrait(TraitId.Impassable);
    return CommandData[CommandId.SWITCH].getCommand(
      entity.id
      , entity.id
      , traitAutoDoor.get(traitImpassable ? 'toOpen' : 'toClose')
    );
  }
});

createTraitData(TraitId.StatStrength, {
});

createTraitData(TraitId.Crate, {
  onAttach: (entity) => entity
    .addTrait(TraitId.GfxText, 'O')
    .addTrait(TraitId.PhysItem, null)
    .addTrait(TraitId.Impassable, true)
});

createTraitData(TraitId.PhysItem, {
});

createTraitData(TraitId.MnstrTargetDummy, {
  onAttach: (entity) => entity
    .addTrait(TraitId.GfxText, 't')
    .addTrait(TraitId.Impassable, true)
});

createTraitData(TraitId.MnstrZombie, {
  onAttach: (entity) => entity
    .addTrait(TraitId.GfxText, 'z')
    .addTrait(TraitId.Impassable, true)
});

createTraitData(TraitId.Wire, {
});

export default TraitData;