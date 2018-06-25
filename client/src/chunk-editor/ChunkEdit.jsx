import _ from 'lodash';
import React from 'react';
// import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getChunk} from './actions';
import {withRouter} from "react-router-dom";
import {compose} from "redux";
import {selectChunk} from "./selectors";

import LoadData from "../util/LoadData";

const RADIUS = 1;
const SCALE = 1;
const SVG_WIDTH = 300;
const SVG_HEIGHT = 300;
const VB_WIDTH = 3;
const VB_HEIGHT = 3;
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
        , bbx: {minX: 0, minY: 0, maxX: 1, maxY: 1, width: 2, height: 2}
      }
    }
    return {};
  }

  handleClick(e) {
    e.persist();
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

  onClick(e) {
    this.clickedOnce = undefined;
    const bbx = this.svg.getBoundingClientRect();
    const tx = this.getXY(e.clientX - bbx.left
      , this.state.bbx.minX
      , this.state.bbx.width
      , SVG_WIDTH
    );
    const ty = this.getXY(e.clientY - bbx.top
      , this.state.bbx.minY
      , this.state.bbx.height
      , SVG_HEIGHT
    );
    this.createNode(tx, ty);
  }

  onDoubleClick(e) {
    // const tx = );
    // const ty = this.getCoord(e.clientY - this.offsetY);
    // console.log(e.clientX - this.offsetX, tx, tx * MPL_WIDTH);
    // console.log(e.clientY - this.offsetY, ty, tx * MPL_HEIGHT);
    // 
    // this.createNode(tx, ty);
  }

  getXY(xy, minDimension, dimension, maxDimension) {
    return minDimension + Math.floor(xy / maxDimension * dimension);
  }

  onSvgRender (svg) {
    this.svg = svg;
  }

  createNode(x, y) {
    const node = {id: _.size(this.state.nodes), x, y};
    console.log(node)
    const bbx = this.state.bbx;
    if (x === bbx.minX) {
      bbx.minX--;
      // node.x++;
    } else if (x === bbx.maxX) {
      bbx.maxX++;
      // node.x--;
    }
    if (y === bbx.minY) {
      bbx.minY--;
      node.y++;
    } else if (y === bbx.maxY) {
      bbx.maxY++;
      // node.y--;
    }
    bbx.width = bbx.maxX - bbx.minX + 1;
    bbx.height = bbx.maxY - bbx.minY + 1;
    this.setState({
      nodes: {...this.state.nodes, [node.id]: node}
      , bbx
    })
  }

  render() {
    const {chunk} = this.props;
    if (!chunk) return 'no chunk';
    const vbWidth = (VB_WIDTH + 1) * (RADIUS * 4)
    const vbHeight = (VB_HEIGHT + 1) * (RADIUS * 4)
    
    const {bbx} = this.state;
    return (<div>
      <div>
        {JSON.stringify(bbx)}
      </div>
      <svg onClick={this.handleClick}
                 width={SVG_WIDTH} 
                 height={SVG_HEIGHT} 
                 viewBox={`${bbx.minX * 4} ${bbx.minY * 4} ${bbx.width * 4} ${bbx.height * 4}`}
                 ref={this.onSvgRender}>
      <rect x={-RADIUS*2} y={-RADIUS*2} 
        width='100%' height='100%' 
        fill='green'/>
      {_.range(bbx.width).map((w) => 
        _.range(bbx.height).map((h) => (
        <rect key={w+''+h}
              className='GridAdd' 
              x={(bbx.minX + w) * RADIUS * 4 } 
              y={(bbx.minY + h) * RADIUS * 4}
              height={RADIUS*4} width={RADIUS*4} />
      )))}
      {_.map(this.state.nodes, node => (
        <circle key={node.id}
                id={node.id}
                className='Node'
                r={RADIUS}
                x={node.x}
                y={node.y}
                cx={(bbx.minX + node.x) * RADIUS * 4 + 2}
                cy={(bbx.minY + node.y) * RADIUS * 4 + 2}
                onMouseDown={this.onMouseDown}
        />))}
      </svg>
    </div>);
  }
}

export default compose(
  LoadData([({match}) => getChunk(match.params.id)])
  , connect((state, {match}) => ({chunk: selectChunk(state, match.params.id), chunks: state.chunks}))
)(ChunkEdit);
