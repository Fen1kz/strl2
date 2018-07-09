export const createReducer = (initialState, lookupTable) =>
  (state = initialState, action) =>
    lookupTable[action.type]
      ? lookupTable[action.type](state, action.payload, action.meta)
      : state;