import _ from 'lodash';
import {Record, List, Map, fromJS} from 'immutable';

import * as Rx from "rxjs/index";
import * as op from "rxjs/operators";

import CONST_GAME from '../../rdx.game._';
import TraitId from "../traits/TraitId";
import {updateViaReduce} from "../Model.utils";
import {selectGame} from "../../rdx.game.selectors";
import {
  action$gameLoopContinue
  , action$gameLoopEnergy
  , action$entityCommandRequestActions
  , action$entityCommandGetResult
  , action$entityCommandScheduleEffect
  , action$entityCommandApplyEffects
} from "../../rdx.game.actions";
import CommandData, {CommandTargetType} from "../commands/CommandData";
import {CommandResultType} from "../commands/CommandResult";
import CommandResult from "../commands/CommandResult";
import {getCommandResult} from "../commands/Command.utils";

const consoleObs = (name) => ({
  next: v => console.log(name, v)
  , error: e => console.error(name, e)
  , complete: () => console.log(name, 'Completed')
});

export function LoopSystem() {
  const queue$ = new Rx.Subject();
  // queue$.subscribe(consoleObs('queue$'));
  return {
    running: false
    , scheduledEffects: List()
    , queue: List()
    , animate: false
    , actors: Map()
    , getEntityEnergy(entityId) {
      return this.actors.get(entityId);
    }
    , updateEntityEnergy(entityId, cb) {
      return this.updateIn(['actors', entityId], cb);
    }
    , events: {
      onEntityAttach(entity) {
        if (entity.hasTrait(TraitId.Energy)) {
          return this.setIn(['actors', entity.id], 0);
        }
        return this;
      }
      , onEntityDetach(entity) {
        if (entity.hasTrait(TraitId.Energy)) {
          return this.removeIn(['actors', entity.id]);
        }
        return this;
      }
      , [CONST_GAME.playerCommand]({command}) {
        queue$.next(command);
        return this;
      }
    }
    , rxEvents: {
      [CONST_GAME.gameLoopStart]() {
        return Rx.of(action$gameLoopContinue());
      }
      , [CONST_GAME.gameLoopContinue]() {
        const actorsArrayOfCommands = this.actors.keySeq().toArray()
          .filter(entityId => this.getEntityEnergy(entityId) >= 0)
          .map(entityId => entityCommandRequestActions(this, entityId, queue$));

        if (actorsArrayOfCommands.length === 0) {
          return Rx.concat(
            Rx.of(action$gameLoopEnergy())
            , Rx.of(action$gameLoopContinue())
          )
        } else {
          return Rx.concat(
            Rx.forkJoin(actorsArrayOfCommands)
              .pipe(
                op.concatAll() // [[C, C], [C, C], [C, C]] => [C, C] - [C, C] - [C, C]
                , op.concatAll() // [C, C] - [C, C] - [C, C] => C - C - C - C - C - C
                , op.concatMap(command => entityCommandGetResult(this, command, queue$)
                )
              )
            , Rx.of(action$gameLoopContinue()).pipe(op.delay(100))
          )
        }
      }
    }
  }
}

function entityCommandRequestActions(game, entityId, queue$) {
  const entity = game.getEntity(entityId);
  const entityCommandArray = entity.getCommandsArray()
    .map(handler => handler(game, entity))
    .filter(command => !!command)
    .map(command => command === TraitId.Player
      ? queue$.asObservable().pipe(op.first())
      : Rx.of(command));

  return (entityCommandArray.length === 0
    ? Rx.of([])
    : Rx.forkJoin(entityCommandArray))
}

function entityCommandGetResult(game, command, queue$) {
  const entityId = command.sourceId;
  const commandResult = getCommandResult(game, command);
  switch(commandResult.status) {
    case CommandResultType.SUCCESS:
      return Rx.of(action$entityCommandScheduleEffect(command));
    case CommandResultType.REPLACE:
    case CommandResultType.REPLACE_FORCED:
      return entityCommandGetResult(game, commandResult.command, queue$);
    case CommandResultType.FAILURE:
      return entityCommandRequestActions(game, entityId, queue$)
        .pipe(
          op.concatAll()
          , op.map(command => entityCommandGetResult(game, command, queue$))
          , op.concatMap(a => Rx.isObservable(a) ? a : Rx.of(a))
        );
    default:
      console.error(`Invalid commandResult`, commandResult);
      throw new Error(`Invalid commandResult ${commandResult}`);
  }
}