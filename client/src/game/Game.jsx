import React from 'react';
import {connect} from "react-redux";

import {CELLSIZE, CELLSIZE2, translateXY} from "./const.game";

import {
  action$loadGameViewComplete
  , action$gameLoopStart
  , action$gameLoopStop
} from "./rdx.game.actions";

import {
  action$entityClicked
  , action$tileClicked
} from "./input/rdx.input.actions";

import {updates$, frames$} from "./rdx.game.epic";
import {selectGame, selectPlayer, selectLevel, selectTile} from './rdx.game.selectors'

import './game.css';

import Entity from './gfx/Entity';
import Tile from './gfx/Tile';

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

  onEntityClick = (entity) => {
    this.props.action$entityClicked(entity.id, entity.tileId);
  };

  onTileClick = (tile) => {
    this.props.action$tileClicked(tile.id);
  };

  render() {
    const {game, player, tiles} = this.props;

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
          {player && <Entity entity={player}/>}
          {game.emap && game.emap.valueSeq().map(entity => isInsideViewport(game.camera, entity)
            ? <Entity key={entity.id} entity={entity} onClick={this.onEntityClick}/>
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
    , action$tileClicked, action$entityClicked
  }
)(Game);
