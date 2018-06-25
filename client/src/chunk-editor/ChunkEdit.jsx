import _ from 'lodash';
import React from 'react';
// import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getChunk} from './actions';
import {withRouter} from "react-router-dom";
import {compose} from "redux";
import {selectChunk} from "./selectors";

import LoadData from "../util/LoadData";

const RADIUS = 2;
const SVG_WIDTH = 200;
const SVG_HEIGHT = 200;
const VB_WIDTH = 20;
const VB_HEIGHT = 20;
const MPL_WIDTH = VB_WIDTH / SVG_WIDTH;
const MPL_HEIGHT = VB_HEIGHT / SVG_HEIGHT;

class ChunkEdit extends React.PureComponent {
  constructor() {
    super();
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
    this.onSvgRender = this.onSvgRender.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {chunk} = nextProps;
    if (chunk && chunk !== prevState.chunk) {
      return {
        chunk
        , nodes: chunk.nodes
      }
    }
    return {};
  }

  handleClick(e) {
    if (!this._delayedClick) {
      this._delayedClick = _.debounce(this.onClick, 200);
    }
    if (this.clickedOnce) {
      this._delayedClick.cancel();
      this.clickedOnce = false;
      this.onDoubleClick(e);
    } else {
      this._delayedClick(e);
      this.clickedOnce = true;
    }
  }

  onClick() {
    this.clickedOnce = undefined;
    console.log('click')
  }

  onDoubleClick(e) {
    const tx = this.getCoord(e.clientX - this.offsetX);
    const ty = this.getCoord(e.clientY - this.offsetY);
    console.log(e.clientX - this.offsetX, tx, tx * MPL_WIDTH);
    console.log(e.clientY - this.offsetY, ty, tx * MPL_HEIGHT);

    this.createNode(tx, ty);
  }

  getCoord(coord) {
    return Math.round(coord * MPL_WIDTH / (RADIUS * 4)) * (RADIUS * 4);
  }

  onSvgRender (c) {
    if (c) {
      const bbx = c.getBoundingClientRect();
      this.offsetX = bbx.left;
      this.offsetY = bbx.top;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  createNode(x, y) {
    const node = {id: _.size(this.state.nodes), x, y};
    this.setState({nodes: {...this.state.nodes, [node.id]: node}})
  }

  render() {
    const {chunk} = this.props;
    if (!chunk) return 'no chunk';
    return (<svg onClick={this.handleClick}
                 width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`${-RADIUS} ${-RADIUS} ${VB_WIDTH+RADIUS*2} ${VB_HEIGHT+RADIUS*2}`}
                 ref={this.onSvgRender}>
      <rect x={-RADIUS} y={-RADIUS} width='100%' height='100%' fill='green'/>
      {_.map(this.state.nodes, node => (
        <circle key={node.id}
                id={node.id}
                className='Node'
                r={RADIUS}
                cx={node.x}
                cy={node.y}
                onMouseDown={this.onMouseDown}
        />))}
    </svg>);
  }
}

export default compose(
  LoadData([({match}) => getChunk(match.params.id)])
  , connect((state, {match}) => ({chunk: selectChunk(state, match.params.id), chunks: state.chunks}))
)(ChunkEdit);