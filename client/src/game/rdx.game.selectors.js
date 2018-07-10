import { createSelector } from 'reselect'

export const selectGame = state => state.get('game');
export const selectQueueFirst = createSelector(selectGame
  , game => game.get('queue').first());

export const selectPlayer = createSelector(selectGame
  , game => game.get('player'));
