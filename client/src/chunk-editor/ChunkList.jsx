import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getChunk, getChunkList} from './actions';
import ChunkView from './ChunkView';
import {selectChunks} from './selectors';
import LoadData from "../util/LoadData";

class ChunkList extends React.PureComponent {
  render() {
    return (
      <div className="ChunkList">
        {_.map(this.props.chunks, (chunk) =>
          <ChunkView onClick={() => this.props.history.push(`/chunk/${chunk.id}`)} key={chunk.id} chunk={chunk}/>
        )}
      </div>
    );
  }
}

export default compose(
  LoadData([() => getChunkList()])
  , withRouter
  , connect(
    state => ({chunks: selectChunks(state) || {}})
  )
)(ChunkList);