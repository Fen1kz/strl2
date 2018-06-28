import React from 'react';

export class OnHover extends React.PureComponent {
  constructor() {
    super();
    this.state = {hover: false};
  }

  handleHover(hover) {
    this.setState({hover});
  }

  render() {
    return (<g
      onMouseEnter={() => this.handleHover(true)}
      onMouseLeave={() => this.handleHover(false)}>
      {this.props.children(this.state.hover)}
    </g>);
  }
}
