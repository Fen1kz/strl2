import React from 'react';
import {connect} from "react-redux";

import {CELLSIZE, CELLSIZE2} from "./const.game";

import {action$loadGameViewComplete, action$gameLoopStart, action$gameLoopStop} from "./rdx.game.actions";
import {updates$, frames$} from "./rdx.game.epic";
import {selectGame, selectPlayer, selectLevel} from './rdx.game.selectors'

// import Level from './level/Level
import './game.css';

const Player = ({player}) => (
  <g className='Player' style={{
    transform: `translate(${player.pos.x * CELLSIZE}px, ${player.pos.y * CELLSIZE}px)`
  }}>
    <circle cx='0' cy='0' r={CELLSIZE / 2}/>
  </g>
);

const Tile = ({tile}) => {
  const x = tile.pos.x * CELLSIZE;
  const y = tile.pos.y * CELLSIZE;

  return (<g className='Tile' style={{
    transform: `translate(${x}px, ${y}px)`
  }}>
    <text>{tile.text}</text>
    <rect x={-CELLSIZE2} y={-CELLSIZE2} width={CELLSIZE} height={CELLSIZE}/>
  </g>)
};

const GameQueue = ({start, queue}) => {
  let position = start;
  return (<g>
    {queue.map((command, idx) => {
      return <rect width={CELLSIZE2} height={CELLSIZE2} />
    })}
  </g>);
}

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
          {level && level.map(tile => (
            <Tile key={tile.id} tile={tile}/>
          ))}
        </g>
        <g className='Entities'>
          {player && <Player player={player}/>}
          <circle cx='-150' cy='-150' r={10}/>
          <circle cx='150' cy='-150' r={10}/>
          <circle cx='-150' cy='150' r={10}/>
          <circle cx='150' cy='150' r={10}/>
        </g>
        <g className='Overlay'>
          {player && <GameQueue start={player.pos} queue={queue}/>}
        </g>

      </svg>
      <pre>
        {JSON.stringify(game.running)}
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
  , {action$loadGameViewComplete, action$gameLoopStart, action$gameLoopStop}
)(Game);
