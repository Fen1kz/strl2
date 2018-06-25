const initialState = null;

export const createReducer = (initialState, lookupTable) =>
  (state = initialState, action) =>
    lookupTable[action.type]
        ? lookupTable[action.type](state, action.payload, action.meta)
        : state;


export default createReducer(initialState, {
  getChunkList: (state, data) => state
  , getChunkListSuccess: (state, data) => data
  , getChunk: (state, data) => state
  , getChunkSuccess: (state, data) => ({...state, [data.id]: data})
});