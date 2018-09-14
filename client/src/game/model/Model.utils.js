import {fromJS} from "immutable";

export const updateViaReduce = (list, cb) => (item) => list.reduce(cb, item);

export const mixSystems = (...systems) => {
  const result = {eventHandlers: {}};
  systems.forEach(system => {
    for (let key in system) {
      if (system.hasOwnProperty(key)) {
        const value = system[key];
        if (key === 'events') {
          for (let eventKey in value) {
            if (value.hasOwnProperty(eventKey)) {
              const eventValue = value[eventKey];
              result[eventKey] = function (...args) {
                return this.eventHandlers
                  .get(eventKey)
                  .reduce((result, eventHandler) => {
                    return eventHandler.apply(result, args)
                  }, this);
              };
              if (!result.eventHandlers[eventKey]) result.eventHandlers[eventKey] = [];
              result.eventHandlers[eventKey].push(eventValue);
            }
          }
        } else if (key in result) {
          throw Error(`Duplicate key[${key}]`);
        } else {
          result[key] = value;
        }
      }
    }
  });
  result.eventHandlers = fromJS(result.eventHandlers);
  return result;
};