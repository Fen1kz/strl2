import React from "react";

import {translateXY} from "../const.game";

import {STAT, TRAIT_TYPE} from "../model/EntityModel";

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

    return (this.text && <g className='Entity' onClick={this.onClick} style={{
      transform: `translate(${translateXY(entity)})`
    }}>
      <text className='EntityText'>{this.text}</text>
    </g>);
  }
}

export default Entity;