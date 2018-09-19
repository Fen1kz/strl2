import React from "react";

import {translateXY} from "../const.game";

import TraitId from "../model/traits/TraitId";
import TraitData from "../model/traits/TraitData";

export class EntityAutoDoor_ extends React.PureComponent {

}

// const connect(EntityAutoDoor

export const EntityText = ({entity}) => {
  if (entity.hasTrait(TraitId.TextGfx)) {
    this.text = entity.getTrait(TraitId.TextGfx);
  } else if (entity.hasTrait(TraitId.GfxRequestText)) {
    const requestTraitId = entity.getTrait(TraitId.GfxRequestText);
    this.text = TraitData[requestTraitId].getGfx(entity);
  } else {
    this.text = '?';
  }
  return <text className='EntityText'>{this.text}</text>
};

export class Entity extends React.PureComponent {
  constructor(props) {
    super(props);
    const {entity, onClick} = this.props;

    if (onClick) {
      this.onClick = () => {
        this.props.onClick(entity);
      };
    }
  }

  render() {
    const {entity, xy} = this.props;

    return (<g className={'Entity ' + entity.traits.keySeq().join(' ')} onClick={this.onClick} style={{
      transform: `translate(${translateXY(xy)})`
    }}>
      <EntityText entity={entity}/>
    </g>);
  }
}

export default Entity;