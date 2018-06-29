import React from 'react';
import {RADIUS, CELLSIZE} from './ChunkEdit.config.js';

export const ChunkEditNode = ({node
  , selected
  , cx, cy
  , ...props}) => (
  <g {...props}>
  <circle
    id={node.id}
    className={`ChunkEdit_Node${selected?' Selected':''}`}
    r={RADIUS}
    data-x={node.x}
    data-y={node.y}
    cx={cx}
    cy={cy}
    />
  <text className='ChunkEdit_Node_Text'
    x={cx} y={cy}>
    {node.text}
  </text>
</g>);

export default ChunkEditNode;
