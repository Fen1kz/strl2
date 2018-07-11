import { createSelector } from 'reselect'

export const selectGame = state => state.get('game');

export const selectQueueFirst = createSelector(selectGame
  , game => game.queue.first());

export const selectPlayer = createSelector(selectGame
  , game => game.player);

export const selectLevel = createSelector(selectGame
  , game => game.level);
