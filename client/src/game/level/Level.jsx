import React from 'react';

export class Level extends React.Component {

  componentDidMount() {
    const {levelData} = this.props;

    const level = levelData.map.split('\n')
      .filter(row => row.length > 0)
      .map(row => row.split(''));
    console.log(level);
    return {};
  }

  render() {
    return (<g className='Level'>

    </g>);
  }
}

export default Level;