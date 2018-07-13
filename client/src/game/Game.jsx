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
import {ENTITY_TRAIT} from "./model/EntityModel";

const Player = (({player}) => (
    <g className='Player' style={{
      transform: `translate(${player.x * CELLSIZE}px, ${player.y * CELLSIZE}px)`
    }}>
      <circle cx='0' cy='0' r={CELLSIZE / 2}/>
    </g>
  )
);

class Tile extends React.PureComponent {
  onClick = () => {
    this.props.onClick(this.props.tile.id);
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

class Entity extends React.PureComponent {
  constructor(props) {
    super(props);
    const entity = this.props.entity;
    if (entity.getTrait(ENTITY_TRAIT.TraitWall)) {
      this.text = '#';
    } else if (entity.getTrait(ENTITY_TRAIT.TraitDoor)) {
      this.text = '+';
    } else if (entity.getTrait(ENTITY_TRAIT.TraitPlayerSpawnPoint)) {
      this.text = '@';
    } else {
      this.text = null;
    }
  }

  onClick = () => {
    this.props.onClick(this.props.entity.tileId);
  };

  render() {
    const {entity} = this.props;
    const x = entity.x * CELLSIZE;
    const y = entity.y * CELLSIZE;
    return (this.text && <g className='Entity' onClick={this.onClick} style={{
      transform: `translate(${x}px, ${y}px)`
    }}>
      <text className='EntityText'>{this.text}</text>
    </g>);
  }
}

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

  onTileClick = (tileId) => {
    this.props.action$levelTileClicked(tileId);
  };

  render() {
    const {game, player, tiles, elist} = this.props;

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
          {tiles && tiles.map(tile => isInsideViewport(game.camera, tile)
            ? <Tile key={tile.id} tile={tile} onClick={this.onTileClick}/>
            : null
          )}
        </g>
        <g className='Entities'>
          {player && <Player player={player}/>}
          {game.elist && game.elist.valueSeq().map(entity => isInsideViewport(game.camera, entity)
            ? <Entity key={entity.id} entity={entity} onClick={this.onTileClick}/>
            : null
          )}
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
    , tiles: selectLevel(state)
  })
  , {
    action$loadGameViewComplete, action$gameLoopStart, action$gameLoopStop
    , action$levelTileClicked
  }
)(Game);
