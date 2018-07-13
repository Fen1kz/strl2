export const createReducer = (initialState, lookupTable) =>
  (state = initialState, action) =>
    lookupTable[action.type]
      ? lookupTable[action.type](state, action.data)
      : state;

export const switchReducer = (mapper, lookupTable) => (state, actionData) => {
  const key = mapper(state, actionData);
  return ((lookupTable[key])
    ? lookupTable[key](state, actionData)
    : state
  )
};