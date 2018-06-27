import _ from 'lodash';
import React from 'react';
// import PropTypes from 'prop-types';

import {RADIUS, CELLSIZE} from './ChunkEdit.config';

export const ChunkEditCell = ({x, y, ...props}) => (<rect 
  key={x+''+y}
  className='ChunkEdit_Cell'
  x={x * CELLSIZE} y={y * CELLSIZE}
  height={CELLSIZE} width={CELLSIZE} 
  {...props}
/>);

export const ChunkEditCells = ({width, height, onCellClick}) => (<g>
  {_.range(width).map(x => 
    _.range(height).map(y => (
      <ChunkEditCell 
        key={x+''+y} 
        x={x} y={y}
        onMouseUp={(e) => onCellClick(e, x, y)}/>
      )
    )
  )}
</g>);

export default ChunkEditCells;
