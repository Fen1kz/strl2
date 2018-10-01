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
    .addTrait(TraitId.TextGfx, '@')
  , requestCommand(game, entity) {
    if (!game.queue.isEmpty()) {
      return game.queue.first();
    } else {
      return TraitId.Player;
    }
  }
});

createTraitData(TraitId.Impassable, {
  // onAttach: (entity, traitData) => entity
  // commandResult: {
  //   [CommandId.MOVE]: (game, {targetId}) => {}
  // }
});

createTraitData(TraitId.Interactive, {
  // onAttach: (entity, traitData) => entity
  defaultData: null
});

createTraitData(TraitId.Energy, {
  // onAttach: (entity, traitData) => entity
});

createTraitData(TraitId.TextGfx, {
});

createTraitData(TraitId.GfxRequestText, {
});

createTraitData(TraitId.Door, {
  onAttach: (entity, traitData) => entity
    .addTrait(TraitId.Impassable, traitData)
    .addTrait(TraitId.Interactive, TraitId.Door)
    .addTrait(TraitId.GfxRequestText, TraitId.Door)
  , getGfx: (entity) => entity.getTrait(TraitId.Impassable) ? '+' : '-'
  , onCommand: {
    [CommandId.INTERACT]: (game, sourceId, targetId) => {
      const traitImpassable = game.getEntityTrait(targetId, TraitId.Impassable);
      if (traitImpassable) {
        return CommandData[CommandId.OPEN].getCommand(sourceId, targetId, 10)
      } else {
        return CommandData[CommandId.CLOSE].getCommand(sourceId, targetId, 10)
      }
    }
  }
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
    if (traitImpassable) {
      return CommandData[CommandId.OPEN].getCommand(entity.id, entity.id, traitAutoDoor.get('toOpen'))
    } else {
      return CommandData[CommandId.CLOSE].getCommand(entity.id, entity.id, traitAutoDoor.get('toClose'))
    }
  }
});


createTraitData(TraitId.Crate, {
  onAttach: (entity) => entity
    .addTrait(TraitId.TextGfx, 'O')
    .addTrait(TraitId.PhysItem, null)
    .addTrait(TraitId.Impassable, true)
});

createTraitData(TraitId.PhysItem, {
});

export default TraitData;