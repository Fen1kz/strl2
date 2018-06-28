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

import {
  RADIUS,
  CELLSIZE,
  SVG_WIDTH,
  SVG_HEIGHT,
  int2global,
  global2int,
  global2intFloor
} from './chunk-edit/ChunkEdit.config.js';

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
  , SELECT_ADD: 'SELECT_ADD'
  , SELECT_RECT: 'SELECT_RECT'
  , DESELECT: 'DESELECT'
  , CREATE: 'CREATE'
  , MOVE: 'MOVE'
  , LINK: 'LINK'
};

let NODE_ID_COUNTER = 0;

class Keyboard extends React.PureComponent {
  constructor() {
    super();
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keypress', this.onKeyPress);
    document.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener(this.onKeyPress);   
    document.removeEventListener(this.onKeyUp);   
  }

  onKeyPress(e) {
    if (this.props.onKeyPress) {
      this.props.onKeyPress(e);
    }
  }

  onKeyUp(e) {
    if (this.props.onKeyUp) {
      this.props.onKeyUp(e);
    }
  }

  render() {
    return null;
  }
}

class ChunkEdit extends React.PureComponent {
  constructor() {
    super();
    this.state = {};
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKey = this.onKey.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {chunk} = nextProps;
    if (chunk && chunk !== prevState.chunk) {
      NODE_ID_COUNTER = _(chunk.nodes).map('id').max() + 1 || 0;
      return {
        chunk
        , nodes: chunk.nodes
        , bbx: {minX: 0, minY: 0, width: 5, height: 5}
        , selection: {}
      }
    }
    return {};
  }

  selectNode(id, force, empty) {
    const selection = empty ? {} : this.state.selection;
    selection[id] = force === void 0 ? !selection[id] : force;
    return selection;
  }

  selectNodes(nodeIds, force, empty) {
    const selection = empty ? {} : this.state.selection;
    nodeIds.forEach(id => {
      selection[id] = force === void 0 ? !selection[id] : force;
    });
    return selection;
  }

  isSelected(nodeId) {
    return !!this.state.selection[nodeId];
  }

  onChangeDimension(x, y) {
    const {nodes, bbx} = this.state;
    if (x > 0 || x < 0 && _.every(nodes, node => node.x < bbx.width - 1)) {
      bbx.width += x;
      this.setState({bbx: {...bbx}});
    } else if (y > 0 || y < 0 && _.every(nodes, node => node.y < bbx.height - 1)) {
      bbx.height += y;
      this.setState({bbx: {...bbx}});
    }
  }

  getEventGlobalPoint(e) {
    const bbx = this.state.localComponent.getBoundingClientRect();
    const aspect = Math.max((this.state.bbx.width * CELLSIZE) / SVG_WIDTH, (this.state.bbx.height * CELLSIZE) / SVG_HEIGHT);
    const x = (e.clientX - bbx.left) * aspect;
    const y = (e.clientY - bbx.top) * aspect;
    return ({x, y});
  }

  onMouseDown(e, nodeId = null) {
    // e.persist();
    e.stopPropagation();
    const start = this.getEventGlobalPoint(e);
    let type;
    if (nodeId !== null) {
      if (e.shiftKey) {
        type = ACTION.SELECT_ADD;
      } else {
        this.setupDblClick('MouseDown', () => {
          type = ACTION.SELECT;
          start.x = int2global(this.state.nodes[nodeId].x);
          start.y = int2global(this.state.nodes[nodeId].y);
        }, () => {
          type = ACTION.LINK;
          start.x = int2global(this.state.nodes[nodeId].x);
          start.y = int2global(this.state.nodes[nodeId].y);
        });
      }
    } else if (e.ctrlKey) {
      type = ACTION.CREATE;
    } else {
      type = ACTION.DESELECT;
    }
    this.setState({action: {type, start, nodeId}});
  }

  onMouseMove(e) {
    if (this.state.action) {
      e.stopPropagation();
      const action = this.state.action;
      switch (action.type) {
        case ACTION.SELECT_RECT:
        case ACTION.DESELECT:
          this.setState({action: {...action, rect: this.getEventGlobalPoint(e), type: ACTION.SELECT_RECT}});
          break;
        // case ACTION.CREATE:
        //   break;
        case ACTION.LINK:
          this.setState({
            action: {...action, link: this.getEventGlobalPoint(e)}
          });
          break;
        case ACTION.SELECT:
        case ACTION.SELECT_ADD:
          if (this.isSelected(action.nodeId)) {
            this.setState({
              action: this.onMoveActionMove(e, action)
            });
          } else {
            this.setState({
              action: this.onMoveActionMove(e, action)
              , selection: this.selectNode(action.nodeId
                , true
                , action.type === ACTION.SELECT)
            });
          }
          break;
        case ACTION.MOVE:
          this.setState({action: this.onMoveActionMove(e, action)});
          break;
      }
    }
  }

  onMoveActionMove(e, action) {
    const move = this.getEventGlobalPoint(e);
    move.x = global2int(move.x - action.start.x);
    move.y = global2int(move.y - action.start.y);
    // move.x = (move.x - action.start.x);
    // move.y = (move.y - action.start.y);
    if (true || _.every(this.state.nodes, node => {
          const nodeX = node.x + move.x;
          const nodeY = node.y + move.y;
          return (!this.isSelected(node.id) || (
            nodeX < this.state.bbx.width
            && nodeY < this.state.bbx.height
            && nodeX >= 0
            && nodeY >= 0
            && !_.some(this.state.nodes, node2 => (
              !this.isSelected(node2.id)
              && nodeX === node2.x
              && nodeY === node2.y
            ))));
        }
      )) {
      return ({...action, move, type: ACTION.MOVE});
    } else {
      return action;
    }
  }

  onMouseUp(e) {
    if (this.state.action) {
      const state = {};
      const action = this.state.action;
      switch (action.type) {
        case ACTION.SELECT:
          state.selection = this.selectNode(action.nodeId, true, true);
          break;
        case ACTION.SELECT_ADD:
          state.selection = this.selectNode(action.nodeId);
          break;
        case ACTION.SELECT_RECT:
          state.selection = this.selectNodes(this.getRectSelection(action), true, !e.shiftKey);
          break;
        case ACTION.CREATE:
          if (e.ctrlKey) {
            state.nodes = this.createNode(e);
          }
          break;
        // case ACTION.LINK:
        //   break;
        case ACTION.MOVE:
          state.nodes = _.map(this.state.nodes, node => !this.isSelected(node.id) ? node : ({
            ...node
            , x: node.x + action.move.x
            , y: node.y + action.move.y
          }));
          break;
        case ACTION.DESELECT:
          this.setupDblClick('MouseUp', () => {
            state.selection = {};
          }, () => {
            state.nodes = this.createNode(e);
          });
          break;
      }
      state.action = null;
      this.setState(state);
    }
  }
  
  setupDblClick(propName, firstClick, secondClick) {
    const realPropName = '_dblClick' + propName;
    if (!this[realPropName]) {
      firstClick();
      this[realPropName] = true;
      window.setTimeout(() => {
        this[realPropName] = false;
      }, 200);
    } else {
      secondClick();
    }
  }

  createNode(e) {
    const node = this.getEventGlobalPoint(e);
    node.x = global2intFloor(node.x);
    node.y = global2intFloor(node.y);
    if (!_.some(this.state.nodes, n => n.x === node.x && n.y === node.y)) {
      node.id = NODE_ID_COUNTER++;
      const nodes = Object.assign({}, this.state.nodes);
      nodes[node.id] = node;
      return nodes;
    } else {
      return this.state.nodes;
    }
  }

  getRectSelection(action) {
    const startX = action.start.x < action.rect.x ? action.start.x : action.rect.x;
    const startY = action.start.y < action.rect.y ? action.start.y : action.rect.y;
    const endX = action.start.x < action.rect.x ? action.rect.x : action.start.x;
    const endY = action.start.y < action.rect.y ? action.rect.y : action.start.y;
    return _(this.state.nodes)
      .filter((node) => (
        startX < int2global(node.x) - RADIUS
        && startY < int2global(node.y) - RADIUS
        && endX > int2global(node.x) + RADIUS
        && endY > int2global(node.y) + RADIUS
      ))
      .map(node => node.id)
      .value();
  }
  
  onKey(e) {
    const symbol = String.fromCharCode(e.keyCode).toUpperCase();
    const nodes = {};
    const selection = _(this.state.selection)
      .pickBy()
      .keys()
      .forEach(nodeId => {
        nodes[nodeId] = Object.assign({}, this.state.nodes[nodeId]);
        nodes[nodeId].text = symbol;
      });
    if (_.size(nodes) > 0) {
      this.setState({nodes: Object.assign({}, this.state.nodes, nodes)});
    }
  }

  render() {
    const {chunk} = this.props;
    if (!chunk) return 'no chunk';

    const {bbx, action} = this.state;
    const viewBox = `${bbx.minX * CELLSIZE} ${bbx.minY * CELLSIZE}`
      + ` ${bbx.width * CELLSIZE} ${bbx.height * CELLSIZE}`;
    return (<div className="ChunkEdit">
      <div>
        <button onClick={e => this.onChangeDimension(+1, 0)}>X+</button>
        <button onClick={e => this.onChangeDimension(-1, 0)}>X-</button>
        <button onClick={e => this.onChangeDimension(0, +1)}>Y+</button>
        <button onClick={e => this.onChangeDimension(0, -1)}>Y-</button>
        {JSON.stringify(NODE_ID_COUNTER)}
        u{JSON.stringify(this._dblClickMouseUp)}
      </div>
      <div>
        <svg onClick={this.handleClick}
             width={SVG_WIDTH}
             height={SVG_HEIGHT}
             viewBox={viewBox}
             onMouseDown={e => this.onMouseDown(e, null)}
             onMouseMove={this.onMouseMove}
             onMouseUp={this.onMouseUp}
             onMouseLeave={(e) => this.onMouseUp(e)}
        >
          <Keyboard onKeyPress={this.onKey}/>
          <g ref={c => this.setState({localComponent: c})}>
            <ChunkEditCells
              width={bbx.width}
              height={bbx.height}
            />
            {_.map(this.state.nodes, node => {
                const selected = !!this.isSelected(node.id);
                let cx, cy;
                if (selected && action && action.move) {
                  cx = int2global(node.x + action.move.x);
                  cy = int2global(node.y + action.move.y);
                  // cx = int2global(node.x) + action.move.x;
                  // cy = int2global(node.y) + action.move.y;
                } else {
                  cx = int2global(node.x);
                  cy = int2global(node.y);
                }
                return (<ChunkEditNode
                  key={node.id}
                  onMouseDown={e => this.onMouseDown(e, node.id)}
                  selected={selected}
                  node={node}
                  cx={cx}
                  cy={cy}
                />);
            })}
            {action && action.rect && <SelectionRect
              p1={action.start} p2={action.rect}/>}
            {action && action.link && <line className="ChunkEdit_LinkLine"
              x1={action.start.x} y1={action.start.y}
              x2={action.link.x} y2={action.link.y}
            />}
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
