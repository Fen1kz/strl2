export const createReducer = (initialState, lookupTable, defaultFn = state => state) =>
  (state = initialState, action) =>
    lookupTable[action.type]
      ? lookupTable[action.type](state, action.data)
      : defaultFn(state, action);