import React from "react";

import {CELLSIZE, CELLSIZE2} from "../const.game";

export class Tile extends React.PureComponent {
  onClick = () => {
    this.props.onClick(this.props.tile);
  };

  render() {
    const {tile} = this.props;
    const x = tile.x * CELLSIZE;
    const y = tile.y * CELLSIZE;
    return (<g className='Tile' onClick={this.onClick} style={{
      transform: `translate(${x}px, ${y}px)`
    }}>
      <rect x={-CELLSIZE2} y={-CELLSIZE2} width={CELLSIZE} height={CELLSIZE}/>
      <text y={CELLSIZE2 / 2} className='TileTextDbg'>{tile.id}</text>
    </g>);
  }
}

export default Tile;