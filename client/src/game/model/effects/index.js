import {Record} from 'immutable';

import * as Rx from "rxjs";
import * as op from "rxjs/operators";

import CommandData from "../commands/CommandData";
import CommandResult from "../commands/CommandResult";
import CommandId from "../commands/CommandId";

export const EffectApplier = {
  CommandEffect: (game, command, {commandId}, sourceId, targetId) => {
    const commandReplacement = CommandData[commandId].getCommand;
    return commandReplacement(sourceId, targetId, command.cost);
  }
  , WireEffect: (game, command, {targets, effect}, sourceId, _targetId) => {
    const commandReplacement = CommandData[CommandId.COMBINED].getCommand;
    return commandReplacement(targets.map(targetId => {
      return EffectApplier[effect.id](game, command, effect, sourceId, targetId)
    }));
  }
};

export const CommandEffect = new Record({
  id: 'CommandEffect'
  , commandId: null
  , data: null
}, 'CommandEffect');

export const WireEffect = new Record({
  id: 'WireEffect'
  , targets: []
  , effect: null
}, 'WireEffect');