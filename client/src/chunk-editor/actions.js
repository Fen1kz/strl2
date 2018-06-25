export const getChunkList = () => ({
  type: 'getChunkList',
  payload: {}
});

export const getChunkListSuccess = (chunks) => ({
  type: 'getChunkListSuccess',
  payload: chunks
});

export const getChunk = (id) => ({
  type: 'getChunk',
  payload: id
});

export const getChunkSuccess = (chunk) => ({
  type: 'getChunkSuccess',
  payload: chunk
});
