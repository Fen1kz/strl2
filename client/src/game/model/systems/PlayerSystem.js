import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';
import {SystemModel, SystemId, SystemModelProps} from './SystemModel';

import CONST_INPUT from '../../input/rdx.input._';
import {action$entityAbility} from "../../rdx.game.actions";

import {selectGame} from "../../rdx.game.selectors";
import * as Rx from "rxjs/index";
import {PositionSystemModel} from "./PositionSystem";


export class PlayerSystemModel extends Record({
  ...SystemModelProps
  , id: SystemId.Player
  , playerId: null
  , eventMap: Map({
    [CONST_INPUT.tileClicked]: (state, {tileId}) => {
      const game = selectGame(state);

      const player = game.system.Player.getPlayer(game);
      const tile = game.getTile(tileId);

      if (tile.isNext(player.tileId)) {
        return Rx.of((action$entityAbility(
            'MOVE'
            , player.id
            , tileId
          ))
        )

        // const elist = tile.getEntityList(game);
        //
        // let abils = elist.reduce((entityActionList, entity) => {
        //     return entityActionList.concat(
        //       entity.getAbilities(game, player, entity).map(abil => [abil, entity.id])
        //     );
        //   }, player.getAbilities(game, player, tile).map(abil => [abil, tile.id])
        // );
        //
        // if (abils[0]) {
        //   const [abil, targetId] = abils[0];
        //
        //   return Rx.of(action$entityAbility(
        //     abil.id
        //     , player.id
        //     , targetId
        //   ))
        // }
      }

      return Rx.NEVER;

    }
    // , [CONST_INPUT.entityClicked]: ()
  })
}) {
  onAttach(game) {
    const player = game.emap.find(e => e.traits.has(TraitId.TraitPlayer));
    if (player) {
      return game.setIn(['system', this.id, 'data'], player.id)
        .update('camera', camera => camera.setTo(player.data.get('tileId')));
    } else {
      return game;
    }
  }

  onEntityAttach(game, entity) {
    if (entity.traits.has(TraitId.TraitPlayer)) {
      return game.updateSystem(this.id, system => system.set('playerId', entity.id));
    }
    return game;
  }

  getPlayer(game) {
    return game.getEntity(this.playerId)
  }
}

export const PlayerSystem = new PlayerSystemModel();