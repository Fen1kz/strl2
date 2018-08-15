import _ from "lodash";
import {Record, Map, List} from "immutable";
import {TraitModel, TraitId} from '../TraitModel';
import {System, SystemId} from '../ECS';

import CONST_INPUT from '../../input/rdx.input._';
import {action$entityAbility} from "../../rdx.game.actions";

import {selectGame} from "../../rdx.game.selectors";
import * as Rx from "rxjs/index";

export const Player = System.fromJS({
  id: SystemId.Player
  , eventMap: {
    [CONST_INPUT.tileClicked]: (state, {tileId}) => {
      const game = selectGame(state.value);

      const player = game.getPlayer();
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
  }
  , onAttach() {

  }

  , onEntityAttach(entity) {
    if (entity.traits.has(TraitId.PlayerControlled)) {
      return this.update('elist', elist => elist.push(entity.id));
    }
    return this;
  }

  , onUpdate() {
    console.log('position update')
  }
});