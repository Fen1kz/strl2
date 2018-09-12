import _ from "lodash";
import {Record, Map, List} from "immutable";
import {getTileX, getTileY} from "../const.game";

export const STAT = {
  Impassable: 'Impassable'
  , Locked: 'Locked'
  , HealthPoints: 'HealthPoints'
};

export const ABILITY_TARGET_TYPE = {
  TILE: 'TILE'
  , ENTITY: 'ENTITY'
};


export const ABILITY_ID = {
  MOVE: 'MOVE'
  , DOOR_OPEN: 'DOOR_OPEN'
  , DOOR_CLOSE: 'DOOR_CLOSE'
};

class EntityAbility extends Record({
  id: null
  , targetType: null
  , validate: () => true
  , execute: null
}) {
  static fromJS(js) {
    return new EntityAbility(js);
  }
}

export const ABILITY = {
  [ABILITY_ID.MOVE]: EntityAbility.fromJS({
    id: ABILITY_ID.MOVE
    , targetType: ABILITY_TARGET_TYPE.TILE
    , validate: (game, source, target) => target.getEntityList(game)
      .every(entity => !entity.getStat(STAT.Impassable))
    , execute: (game, source, target) => game
      .updateEntity(source.id, source => source.set('tileId', target.id))
      .update('camera', camera => camera.setTo(target.id))
  })
  , [ABILITY_ID.DOOR_OPEN]: EntityAbility.fromJS({
    id: ABILITY_ID.DOOR_OPEN
    , targetType: ABILITY_TARGET_TYPE.ENTITY
    , validate: (game, source, target) => target.getStat(STAT.Impassable)
    , execute: (game, source, target) => game
      .updateEntity(target.id, target => target.setStat(STAT.Impassable, !target.getStat(STAT.Impassable)))
  })
  , [ABILITY_ID.DOOR_CLOSE]: EntityAbility.fromJS({
    id: ABILITY_ID.DOOR_CLOSE
    , targetType: ABILITY_TARGET_TYPE.ENTITY
    , validate: (game, source, target) => !target.getStat(STAT.Impassable)
    , execute: (game, source, target) => game
      .updateEntity(target.id, target => target.setStat(STAT.Impassable, !target.getStat(STAT.Impassable)))
  })
};

export const TRAIT_TYPE = {
  TraitWall: 'TraitWall'
  , TraitDoor: 'TraitDoor'
  , TraitDoorControllable: 'TraitDoorControllable'
  , TraitButton: 'TraitButton'
  , TraitBreakable: 'TraitBreakable'
  , TraitPlayerSpawnPoint: 'TraitPlayerSpawnPoint'
  , TraitPlayer: 'TraitPlayer'
};

class EntityTrait extends Record({
  type: null
  , init: _.identity
  , abilities: List()
}) {
  static fromJS(js) {
    return new EntityTrait(js)
      .set('abilities', List(js.abilities))
  }

  getAbilities(game, source, ...params) {
    return this.abilities
      .filter(ability => {
        console.log(`validating ${ability.id}: ${ability.validate(game, source, ...params)}`);
        return ability.validate(game, source, ...params)
      })
      .toArray()
  }
}

export const ENTITY_TRAIT = {
  [TRAIT_TYPE.TraitWall]: EntityTrait.fromJS({
    type: TRAIT_TYPE.TraitWall
    , init: entity => entity.setStat(STAT.Impassable, true)
  })
  , [TRAIT_TYPE.TraitDoor]: EntityTrait.fromJS({
    type: TRAIT_TYPE.TraitDoor
    , init: entity => entity.setStat(STAT.Impassable, true)
    , abilities: [ABILITY[ABILITY_ID.DOOR_OPEN], ABILITY[ABILITY_ID.DOOR_CLOSE]]
  })
  , TraitPlayerSpawnPoint: EntityTrait.fromJS({
    type: TRAIT_TYPE.TraitPlayerSpawnPoint
  })
  , TraitPlayer: EntityTrait.fromJS({
    type: TRAIT_TYPE.TraitPlayer
    , abilities: [ABILITY[ABILITY_ID.MOVE]]
  })
};


// EntityAbility.fromJS({
//   id: 'MOVE'
//   , type: ABILITY_ID.MOVE
//   , traitType: TRAIT_TYPE.TraitPlayer
//   , targetType: ABILITY_TARGET_TYPE.TILE
//   , validate: (game, source, tile) => {
//     console.log(game, source, tile);
//     return tile.getEntityList(game).every(entity => {
//       return !entity.getStat(EntityData.Impassable)
//     })
//   }
//   , execute: (game, source, tile) => game
//     .updateEntity(source.id, source => source.set('tileId', tile.id))
//     .update('camera', camera => camera.setTo(tile.id))
// })

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
          const trait = ENTITY_TRAIT[traitString];
          return entity.addTrait(trait);
        }, self)
      });
  }

  getAbilities(game, source, ...params) {
    return this.traits.reduce((result, trait) => {
      return result.concat(trait.getAbilities(game, source, ...params));
    }, [])
  }

  addTrait(trait, ...params) {
    return this
      .setIn(['traits', trait.type], trait)
      .update(entity => trait.init(entity, ...params))
  }

  getTrait(traitType) {
    return this.traits.get(traitType);
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