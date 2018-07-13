import _ from "lodash";
import {Record, Map} from "immutable";
import {getTileX, getTileY} from "../const.game";

export const ENTITY_STAT = {
  Impassable: 'Impassable'
  , Locked: 'Locked'
  , HealthPoints: 'HealthPoints'
};

export const ENTITY_ACTION = {
  INTERACT: 'INTERACT'
  , ATTACK: 'ATTACK'
  , MOVE: 'MOVE'
};

export const ENTITY_TRAIT = {
  TraitWall: 'TraitWall'
  , TraitDoor: 'TraitDoor'
  , TraitBreakable: 'TraitBreakable'
  , TraitPlayerSpawnPoint: 'TraitPlayerSpawnPoint'
};

class EntityTrait extends Record({
  name: null
  , onInit: _.identity
  , actions: Map()
  , validators: Map()
}) {
  static fromJS(js) {
    return new EntityTrait(js)
      .set('actions', Map(js.actions))
      .set('validators', Map(js.validators))
  }
}

export const EntityTraits = {
  TraitWall: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitWall
    , validators: {
      [ENTITY_ACTION.MOVE]: () => false
    }
  })
  , TraitDoor: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitDoor
    , onInit: (entity) => {
      return entity.setStat(ENTITY_STAT.Impassable, true);
    }
    , validators: {
      [ENTITY_ACTION.MOVE]: (entity) => !entity.getStat(ENTITY_STAT.Impassable)
      , [ENTITY_ACTION.INTERACT]: (entity) => !entity.getStat(ENTITY_STAT.Locked)
    }
    , actions: {
      [ENTITY_ACTION.INTERACT]: (source) => {
        return source
          .setStat(ENTITY_STAT.Impassable, !source.getStat(ENTITY_STAT.Impassable))
      }
    }
  })
  , TraitBreakable: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitBreakable
    , onInit: (entity, hp) => {
      return entity.setIn(['stats', ENTITY_STAT.HealthPoints], hp);
    }
    , actions: {
      [ENTITY_ACTION.ATTACK]: (source) => {
        return source;
      }
    }
  })
  , TraitPlayerSpawnPoint: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitPlayerSpawnPoint
  })
};

/*
* Trait Lifecycle
* init
* update
* remove
* */

export default class EntityModel extends Record({
  id: void 0
  , tileId: void 0
  , traits: Map()
  , stats: Map()
}) {
  static fromJS(js) {
    return new EntityModel(js)
      .update(self => {
        return (js.traitsList || []).reduce((entity, traitString) => {
          const traitName = traitString;
          const trait = EntityTraits[traitString];
          return entity.addTrait(trait);
        }, self)
      });
  }

  addTrait(trait) {
    return this
      .setIn(['traits', trait.name], trait)
      .update(trait.onInit)
  }

  getTrait(traitName) {
    return this.traits.get(traitName);
  }

  setStat(statName, value) {
    return this.setIn(['stats', statName], value);
  }

  getStat(statName) {
    return this.stats.get(statName);
  }

  get x() {
    return getTileX(this.tileId);
  }

  get y() {
    return getTileY(this.tileId);
  }
}