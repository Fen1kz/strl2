import _ from 'lodash';
import React from 'react';
// import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getChunk} from './actions';
import {withRouter} from "react-router-dom";
import {compose} from "redux";
import {selectChunk} from "./selectors";

import LoadData from "../util/LoadData";
import ChunkEditCells from './chunk-edit/ChunkEditCells';
import ChunkEditNode from './chunk-edit/ChunkEditNode';

import {RADIUS, CELLSIZE, SVG_WIDTH, SVG_HEIGHT} from './chunk-edit/ChunkEdit.config.js';

const SelectionRect = ({p1, p2}) => (<rect 
  className="ChunkEdit_Selection"
  x={p1.x < p2.x ? p1.x : p2.x}
  y={p1.y < p2.y ? p1.y : p2.y}
  width={Math.abs(p1.x - p2.x)}
  height={Math.abs(p1.y - p2.y)}
/>);
// width={p1.x < p2.x ? p2.x - p1.x : p1.x - p2.x}
// height={p1.y < p2.y ? p2.y - p1.y : p1.y - p2.y}

const ACTION = {
  SELECT: 'SELECT'
  , MOVE: 'MOVE'
  , LINK: 'LINK'
}

class OnHover extends React.PureComponent {
  constructor() {
    super();
    this.state = {hover: false};
  }
  handleHover(hover) {
    this.props.onHover(hover);
    this.setState({hover});
  }
  
  render() {
    return (<g 
      onMouseEnter={() => this.handleHover(true)} 
      onMouseLeave={() => this.handleHover(false)}>
      {this.props.children(this.state.hover)}
    </g>);
  }
}

class ChunkEdit extends React.PureComponent {
  constructor() {
    super();
    this.state = {};
    this.onCellClick = this.onCellClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {chunk} = nextProps;
    if (chunk && chunk !== prevState.chunk) {
      return {
        chunk
        , nodes: chunk.nodes
        , bbx: {minX: 0, minY: 0, width: 5, height: 5}
        , selection: {}
      }
    }
    return {};
  }
  
  selectNode(id, force) {
    const selection = _.assign({}, this.state.selection);
    selection[id] = force === void 0 ? !selection[id] : force;
    console.log(`selectNode(${id}, ${force})`)
    return selection;
  }
  
  selectNodes(nodes) {
    const selection = _.assign({}, this.state.selection);
    nodes.forEach(({id, force}) => {
      selection[id] = force === void 0 ? !selection[id] : force;
    })
    return selection;
  }
  
  onCellClick(e, x, y) {
    if (_.every(this.state.nodes, (node) => node.x !== x || node.y !== y)) {
      this.createNode(e, x, y);
    }
  }

  createNode(e, x, y) {
    const node = {id: _.size(this.state.nodes), x, y}
    this.setState({
      nodes: {...this.state.nodes, [node.id]: node}
    })
  }
  
  onChangeDimension(x, y) {
    const {nodes, bbx} = this.state;
    if (x > 0 || x < 0 && _.every(nodes, node => node.x < bbx.width-1)) {
      bbx.width += x;
      this.setState({bbx: {...bbx}});
    } else if (y > 0 || y < 0 && _.every(nodes, node => node.y < bbx.height-1)) {
      bbx.height += y;
      this.setState({bbx: {...bbx}});
    }
  }
  
  getEventClientXY (e) {
    const bbx = this.state.localComponent.getBoundingClientRect();
    const x = (e.clientX - bbx.left) * ((this.state.bbx.width * CELLSIZE) / SVG_WIDTH);
    const y = (e.clientY - bbx.top) * ((this.state.bbx.height * CELLSIZE) / SVG_HEIGHT);
    return ({x, y});
  }
  
  onMouseDown(e) {
    e.persist();
    const start = this.getEventClientXY(e);
    this.setState({
      action: {
        start
      }
    });
  }
  
  onMouseMove(e) {
    const action = this.state.action;
    if (action) {
      switch (action.type) {
        case ACTION.SELECT:
          this.setState({action: {...action, rect: this.getEventClientXY(e)}});
          break;
        case ACTION.MOVE:
          console.log(this.state.nodes[0].x)
          if (_.every(this.state.nodes, node => 
            node.x < this.state.bbx.width
            && node.y < this.state.bbx.height
            && node.x > 0
            && node.y > 0
          )) {
            this.setState({action: {...action, move: this.getEventClientXY(e)}});
          }
          break;
        default: 
          if (this.state.hoverNode !== null) {
            this.setState({action: {...action
                , type: ACTION.MOVE
              }
              , selection: this.selectNode(this.state.hoverNode, true)
            });
          } else {
            this.setState({action: {...action
              , type: ACTION.SELECT
            }});
          }
      }
    }
  }
  
  onMouseClick(e) {
  }
  
  onMouseUp(e) {
    const action = this.state.action;
    if (action) {
      if (action.rect) {
        e.stopPropagation();
        console.log('PROPAGATION STOPPED');
        const startX = action.start.x < action.rect.x ? action.start.x : action.rect.x;
        const startY = action.start.y < action.rect.y ? action.start.y : action.rect.y;
        const endX = action.start.x < action.rect.x ? action.rect.x : action.start.x;
        const endY = action.start.y < action.rect.y ? action.rect.y : action.start.y;
        
        const selection = this.selectNodes(
          _(this.state.nodes)
            .filter((node) => {
              // console.log(startX, startY, endX, endY);
              // console.log(node.x, node.y
              //   , node.x * CELLSIZE + CELLSIZE * .5
              //   , node.y * CELLSIZE + CELLSIZE * .5);
              // console.log('node'
              //   , node.x * CELLSIZE + CELLSIZE * .5 - RADIUS
              //   , node.y * CELLSIZE + CELLSIZE * .5 - RADIUS
              //   , node.x * CELLSIZE + CELLSIZE * .5 + RADIUS
              //   , node.y * CELLSIZE + CELLSIZE * .5 + RADIUS
              // );
              // console.log('node'
              //   , startX < node.x * CELLSIZE + CELLSIZE * .5 - RADIUS
              //   , startY < node.y * CELLSIZE + CELLSIZE * .5 - RADIUS
              //   , endX > node.x * CELLSIZE + CELLSIZE * .5 + RADIUS
              //   , endY > node.y * CELLSIZE + CELLSIZE * .5 + RADIUS
              // );
              // console.log('-');
              return (startX < node.x * CELLSIZE + CELLSIZE * .5 - RADIUS
                && startY < node.y * CELLSIZE + CELLSIZE * .5 - RADIUS
                && endX > node.x * CELLSIZE + CELLSIZE * .5 + RADIUS
                && endY > node.y * CELLSIZE + CELLSIZE * .5 + RADIUS
              );
            })
            .map(node => ({id: node.id, force: true}))
            .value()
        );
        this.setState({selection, action: null});
      } else if (action.move) {
        e.stopPropagation();
        console.log('PROPAGATION STOPPED');
        this.setState({action: null});
      } else {
        this.setState({action: null});
      }
    }
  }
  render() {
    const {chunk} = this.props;
    if (!chunk) return 'no chunk';
    
    const {bbx, action} = this.state;
    const viewBox = `${bbx.minX * CELLSIZE} ${bbx.minY * CELLSIZE}`
      + ` ${bbx.width * CELLSIZE} ${bbx.height * CELLSIZE}`;
    return (<div>
      <div>
        <button onClick={e => this.onChangeDimension(+1, 0)}>X+</button>
        <button onClick={e => this.onChangeDimension(-1, 0)}>X-</button>
        <button onClick={e => this.onChangeDimension(0, +1)}>Y+</button>
        <button onClick={e => this.onChangeDimension(0, -1)}>Y-</button>
        {JSON.stringify(this.state.selection)}
        {JSON.stringify(action)}
        {JSON.stringify(this.state.hoverNode)}
      </div>
      <div>
        <svg onClick={this.handleClick}
             width={SVG_WIDTH} 
             height={SVG_HEIGHT} 
             viewBox={viewBox}
             onMouseDown={this.onMouseDown}
             onMouseMove={this.onMouseMove}
             onMouseUpCapture={this.onMouseUp}
             onMouseLeave={() => this.setState({action: null})}
             >
        <g ref={c => this.setState({localComponent: c})}>
          <ChunkEditCells 
            width={bbx.width} 
            height={bbx.height} 
            onCellClick={this.onCellClick}/>
          {_.map(this.state.nodes, node => (
            <OnHover key={node.id} onHover={hover => {
                // console.log(`STATE ${node.id} ${hover}`);
                return this.setState({
                  hoverNode: hover ? node.id : null
                })
              }}>{(hover) => {
                // console.log(`hover ${node.id} ${hover}`);
                const selected = !!this.state.selection[node.id];
                let cx, cy;
                if (selected && action && action.move) {
                  cx = node.x * CELLSIZE + action.move.x - action.start.x;
                  cx = Math.round(cx / CELLSIZE) * CELLSIZE + CELLSIZE * .5;
                  cy = node.y * CELLSIZE + action.move.y - action.start.y;
                  cy = Math.round(cy / CELLSIZE) * CELLSIZE + CELLSIZE * .5;
                } else {
                  cx=node.x * CELLSIZE + CELLSIZE * .5
                  cy=node.y * CELLSIZE + CELLSIZE * .5
                }
                return (<ChunkEditNode 
                  selected={selected}
                  hover={hover}
                  node={node}
                  onMouseUp={e => this.setState({selection: this.selectNode(node.id)})}
                  cx={cx}
                  cy={cy}/>
              )}}
            </OnHover>
          ))}
          {action && action.rect && <SelectionRect 
            p1={action.start} p2={action.rect}/>}
        </g>
        </svg>
      </div>
    </div>);
  }
}

export default compose(
  LoadData([({match}) => getChunk(match.params.id)])
  , connect((state, {match}) => ({chunk: selectChunk(state, match.params.id), chunks: state.chunks}))
)(ChunkEdit);
