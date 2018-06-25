import React from 'react';
// import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const ChunkView = ({chunk, onClick}) => (<svg onClick={onClick} width={200} height={200} viewBox="0 0 10 10">
  <rect x={0} y={0} width={1} height={1} fill="red"/>
  <rect x={9} y={9} width={1} height={1} fill="red"/>
</svg>);

export default ChunkView;

