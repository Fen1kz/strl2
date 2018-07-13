import React from "react";

import {translateXY} from "../const.game";

import {ENTITY_STAT, ENTITY_TRAIT} from "../model/EntityModel";

export class Entity extends React.PureComponent {
  constructor(props) {
    super(props);
    const {entity, onClick} = this.props;
    if (entity.getTrait(ENTITY_TRAIT.TraitWall)) {
      this.text = '#';
    } else if (entity.getTrait(ENTITY_TRAIT.TraitDoor)) {
      if (entity.getStat(ENTITY_STAT.Impassable)) {
        this.text = '+';
      } else {
        this.text = '-';
      }
    } else if (entity.getTrait(ENTITY_TRAIT.TraitPlayer)) {
      this.text = '@';
    } else {
      this.text = null;
    }

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
      <text className='EntityText'>{this.text}</text>
    </g>);
  }
}

export default Entity;