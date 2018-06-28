import React from 'react';
import {RADIUS, CELLSIZE} from './ChunkEdit.config.js';

export const ChunkEditNode = ({node
  , selected, hover
  , onMouseDown
  , cx, cy
  , ...props}) => (
  <g onMouseDown={onMouseDown}>
  <circle
    id={node.id}
    className={`ChunkEdit_Node${selected?' Selected':''}`}
    r={RADIUS}
    data-x={node.x}
    data-y={node.y}
    cx={cx}
    cy={cy}
    {...props}
    />
  <text className='ChunkEdit_Node_Text'
    x={cx} y={cy}>
    {node.text}
  </text>
</g>);

export default ChunkEditNode;
