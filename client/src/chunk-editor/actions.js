export const getChunkList = () => ({
  type: 'getChunkList',
  data: {}
});

export const getChunkListSuccess = (chunks) => ({
  type: 'getChunkListSuccess',
  data: chunks
});

export const getChunk = (id) => ({
  type: 'getChunk',
  data: id
});

export const getChunkSuccess = (chunk) => ({
  type: 'getChunkSuccess',
  data: chunk
});
