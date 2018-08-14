import React from "react";

import {translateXY} from "../const.game";

import {STAT, TRAIT_TYPE} from "../model/EntityModel";

export class EntityAutoDoor_ extends React.PureComponent {

}

// const connect(EntityAutoDoor

export const EntityText = ({entity}) => {
  if (entity.getTrait(TRAIT_TYPE.TraitWall)) {
    this.text = '#';
  } else if (entity.getTrait(TRAIT_TYPE.TraitDoor)) {
    if (entity.getStat(STAT.Impassable)) {
      this.text = '+';
    } else {
      this.text = '-';
    }
  } else if (entity.getTrait(TRAIT_TYPE.TraitPlayer)) {
    this.text = '@';
  } else {
    this.text = null;
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
    const {entity} = this.props;

    return (this.text && <g className='Entity' onClick={this.onClick} style={{
      transform: `translate(${translateXY(entity)})`
    }}>
      <EntityText entity={entity}/>
    </g>);
  }
}

export default Entity;