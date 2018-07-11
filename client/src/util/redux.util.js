export const createReducer = (initialState, lookupTable) =>
  (state = initialState, action) =>
    lookupTable[action.type]
      ? lookupTable[action.type](state, action.data, action.meta)
      : state;