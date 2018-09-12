import React from "react";

import {translateXY} from "../const.game";

import {TraitId} from "../model/TraitModel";

export class EntityAutoDoor_ extends React.PureComponent {

}

// const connect(EntityAutoDoor

export const EntityText = ({entity}) => {
  if (entity.hasTrait(TraitId.TraitWall)) {
    this.text = '#';
  } else if (entity.hasTrait(TraitId.TraitDoor)) {
    this.text = '+';
    // if (entity.getStat(EntityData.Impassable)) {
    //   this.text = '+';
    // } else {
    //   this.text = '-';
    // }
  } else if (entity.hasTrait(TraitId.TraitPlayer)) {
    this.text = '@';
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

    return (<g className='Entity' onClick={this.onClick} style={{
      transform: `translate(${translateXY(xy)})`
    }}>
      <EntityText entity={entity}/>
    </g>);
  }
}

export default Entity;