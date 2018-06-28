import React from 'react';
import {RADIUS, CELLSIZE} from './ChunkEdit.config.js';

export const int2global = (xy) => xy * CELLSIZE + CELLSIZE * .5;
export const global2int = (xy) => Math.round(xy / CELLSIZE);

export const ChunkEditNode = ({node, selected, hover, ...props}) => (<circle
  key={node.id}
  id={node.id}
  className={`ChunkEdit_Node${selected?' Selected':''}${hover?' Hover':''}`}
  r={RADIUS}
  data-x={node.x}
  data-y={node.y}
  {...props}
/>);

export default ChunkEditNode;
