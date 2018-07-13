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
  , TraitDoorControllable: 'TraitDoorControllable'
  , TraitButton: 'TraitButton'
  , TraitBreakable: 'TraitBreakable'
  , TraitPlayerSpawnPoint: 'TraitPlayerSpawnPoint'
  , TraitPlayer: 'TraitPlayer'
};

class EntityTrait extends Record({
  name: null
  , init: _.identity
  , actions: Map()
  , validators: Map()
}) {
  static fromJS(js) {
    return new EntityTrait(js)
      .set('actions', Map(js.actions))
      .set('validators', Map(js.validators))
  }
  
  onInit(entity, ...params) {
    return entity.update(entity => this.init(entity, ...params));
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
    , init: (entity) => {
      return entity.setStat(ENTITY_STAT.Impassable, true);
    }
    , validators: {
      [ENTITY_ACTION.MOVE]: (entity) => !entity.getStat(ENTITY_STAT.Impassable)
    }
  })
  , TraitDoorControllable: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitDoorControllable
    , init: EntityTraits.TraitDoor.init
    , validators: {
      [ENTITY_ACTION.MOVE]: (entity) => !entity.getStat(ENTITY_STAT.Impassable)
    }
  })
  , TraitButton: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitDoor
    , validators: {
      [ENTITY_ACTION.INTERACT]: (entity) => !entity.getStat(ENTITY_STAT.Disabled)
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
    , init: (entity, hp) => {
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
  , TraitPlayer: EntityTrait.fromJS({
    name: ENTITY_TRAIT.TraitPlayer
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

  onValidate(actionName, ...params) {
    return this.traits.every(trait => {
      const validator = trait.validators.get(actionName);
      return !validator || validator(this, ...params);
    })
  }

  addTrait(trait, ...params) {
    return this
      .setIn(['traits', trait.name], trait)
      .update((entity) => trait.onInit(entity, ...params))
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