import _ from 'lodash';
import {Record, fromJS} from "immutable";
// import * as Rx from 'rxjs';
// import * as op from 'rxjs/operators';
import {from} from 'rxjs';
import {concatMap} from 'rxjs/operators';

export const updateViaReduce = (list, cb) => (item) => list.reduce(cb, item);

export const mixSystems = (...systems) => {
  const result = {
    eventHandlers: {}
    , rxEventHandlers: {}
  };
  systems.forEach(system => {
    _.each(system, (value, key) => {
      if (key === 'events') {
        _.each(value, (eventHandler, eventKey) => {
          if (!result.eventHandlers[eventKey]) result.eventHandlers[eventKey] = [];
          result.eventHandlers[eventKey].push(eventHandler);
        });
      } else if (key === 'rxEvents') {
        _.each(value, (eventHandler, eventKey) => {
          if (!result.rxEventHandlers[eventKey]) result.rxEventHandlers[eventKey] = [];
          result.rxEventHandlers[eventKey].push(eventHandler);
        });
      } else if (key in result) {
        throw Error(`Duplicate key[${key}]`);
      } else {
        result[key] = value;
      }
    });
  });
  result.eventHandlers = fromJS(result.eventHandlers);
  result.onEvent = function (eventType, ...eventData) {
    return this.eventHandlers
      .get(eventType)
      .reduce((res, eventHandler) => {
        return eventHandler.apply(res, eventData)
      }, this);
  };
  result.rxEventHandlers = fromJS(result.rxEventHandlers);
  result.onRxEvent = function (eventType, ...eventData) {
    return from(this.rxEventHandlers
      .get(eventType)
      .map((eventHandler) => eventHandler.apply(this, eventData))
    ).pipe(concatMap(v => v));
  };
  return result;
};