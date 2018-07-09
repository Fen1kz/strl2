import React from 'react';
import {connect} from "react-redux";

import {CELLSIZE, CELLSIZE2} from "./const.game";

import {action$gameLoopStart, action$gameLoopStop} from "./rdx.game.actions";
import {updates$, frames$} from "./rdx.game.epic";
import {selectGame, selectPlayer} from './rdx.game.selectors'

// import Level from './level/Level';
import levelData from './level/level-data.sl1';
import './game.css';

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 10;
    this.height = 10;
  }

  setTo(point) {
    this.x = point.x;
    this.y = point.y;
  }

  getViewBox() {
    const x = this.x * CELLSIZE;
    const y = this.y * CELLSIZE;
    const width = this.width * CELLSIZE;
    const height = this.height * CELLSIZE;
    return `${x - width / 2} ${y - height / 2} ${width} ${height}`;
  }
}

const Tile = ({tile}) => {
  const x = tile.x * CELLSIZE;
  const y = tile.y * CELLSIZE;

  return (<g className='Tile' style={{
    transform: `translate(${x}px, ${y}px)`
  }}>
    <text>{tile.text}</text>
    <rect x={-CELLSIZE2} y={-CELLSIZE2} width={CELLSIZE} height={CELLSIZE}/>
  </g>)
};

export class GamePage extends React.Component {
  constructor() {
    super();

    this.camera = new Camera();


    const level = levelData.map.split('\n')
      .filter(row => row.length > 0)
      .map((row, y) => row
        .split('')
        .map((text, x) => ({
          x, y, text
        }))
      );

    this.state = {level};
  }

  componentDidMount() {
    this.props.action$gameLoopStart();
  }

  componentWillUnmount() {
    this.props.action$gameLoopStop();
  }

  render() {
    const {game, player} = this.props;
    this.camera.setTo(player);

    return (<div>
      <div>
        <button onClick={e => this.props.action$gameLoopStart()}>START</button>
        <button onClick={e => this.props.action$gameLoopStop()}>STOP</button>
      </div>
      <svg
        width={300}
        height={300}
        viewBox={this.camera.getViewBox()}
      >
        <g className='Level'>
          {this.state.level.map(row => row.map(tile => {
            return <Tile key={tile.x + '' + tile.y} tile={tile}/>;
          }))}
        </g>
        <g className='Entities'>
          <g className='Player' style={{transform: `translate(${player.x * CELLSIZE}px, ${player.y * CELLSIZE}px)`}}>
            <circle cx='0' cy='0' r={CELLSIZE / 2}/>
          </g>
          <circle cx='-150' cy='-150' r={10}/>
          <circle cx='150' cy='-150' r={10}/>
          <circle cx='-150' cy='150' r={10}/>
          <circle cx='150' cy='150' r={10}/>
        </g>

      </svg>
      <pre>
        {JSON.stringify(game.toJS())}
      </pre>
    </div>);
  }
}

export default connect(
  state => ({
    game: selectGame(state)
    , player: selectPlayer(state)
  })
  , {action$gameLoopStart, action$gameLoopStop}
)(GamePage);
