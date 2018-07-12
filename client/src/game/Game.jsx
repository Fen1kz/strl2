import React from 'react';
import {connect} from "react-redux";

import {CELLSIZE, CELLSIZE2} from "./const.game";

import {
  action$loadGameViewComplete
  , action$gameLoopStart
  , action$gameLoopStop
} from "./rdx.game.actions";
import {
  action$levelTileClicked
} from "./input/rdx.input.actions";

import {updates$, frames$} from "./rdx.game.epic";
import {selectGame, selectPlayer, selectLevel, selectTile} from './rdx.game.selectors'

// import Level from './level/Level
import './game.css';

const Player = connect(
  state => {
    const player = selectPlayer(state);
    return {
      player
      , tile: selectTile(state, player.tileId)
    };
  }
)(({player, tile}) => (
    <g className='Player' style={{
      transform: `translate(${tile.pos.x * CELLSIZE}px, ${tile.pos.y * CELLSIZE}px)`
    }}>
      <circle cx='0' cy='0' r={CELLSIZE / 2}/>
    </g>
  )
);

const Tile = ({tile, onClick}) => {
  const x = tile.pos.x * CELLSIZE;
  const y = tile.pos.y * CELLSIZE;

  return (<g className='Tile' onClick={onClick} style={{
    transform: `translate(${x}px, ${y}px)`
  }}>
    <rect x={-CELLSIZE2} y={-CELLSIZE2} width={CELLSIZE} height={CELLSIZE}/>
    <text className='TileText'>{tile.text}</text>
    <text y={CELLSIZE2 / 2} className='TileTextDbg'>{tile.id}</text>
  </g>)
};

const GameQueue = ({start, queue}) => {
  let position = start;
  return (<g>
    {queue.map((command, idx) => {
      return <rect width={CELLSIZE2} height={CELLSIZE2}/>
    })}
  </g>);
};

const isInsideViewport = (camera, point) => (
  point.x >= camera.minX
  && point.x <= camera.maxX
  && point.y >= camera.minY
  && point.y <= camera.maxY
);

export class Game extends React.Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.props.action$loadGameViewComplete();
  }

  componentWillUnmount() {
    this.props.action$gameLoopStop();
  }

  onTileClick = (tileId) => (e) => {
    this.props.action$levelTileClicked(tileId);
  };

  render() {
    const {game, player, level} = this.props;

    return (<div>
      <div>
        <button onClick={e => this.props.action$loadGameViewComplete()}>START</button>
        <button onClick={e => this.props.action$gameLoopStop()}>STOP</button>
      </div>
      <svg
        width={300}
        height={300}
        viewBox={game.camera.getViewBox()}
      >
        <g className='Level'>
          {level && level.map(tile => isInsideViewport(game.camera, tile.pos)
            ? <Tile key={tile.id} tile={tile} onClick={this.onTileClick(tile.id)}/>
            : null
          )}
        </g>
        <g className='Entities'>
          {player && <Player player={player}/>}
          <circle cx='-150' cy='-150' r={10}/>
          <circle cx='150' cy='-150' r={10}/>
          <circle cx='-150' cy='150' r={10}/>
          <circle cx='150' cy='150' r={10}/>
        </g>
        <g className='Overlay'>
          {/*{player && <GameQueue start={player.tile.pos} queue={game.queue}/>}*/}
        </g>

      </svg>
      <pre>
        {JSON.stringify(game.running)}
        {JSON.stringify(game.queue)}
      </pre>
    </div>);
  }
}

export default connect(
  state => ({
    game: selectGame(state)
    , player: selectPlayer(state)
    , level: selectLevel(state)
  })
  , {
    action$loadGameViewComplete, action$gameLoopStart, action$gameLoopStop
    , action$levelTileClicked
  }
)(Game);
