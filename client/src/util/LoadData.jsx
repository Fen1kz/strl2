import React from "react";
import {connect} from "react-redux";

const LoadData = (requests) => Component => connect(
  () => ({})
  , (dispatch) => ({dispatch})
)(class _LoadData extends React.PureComponent {
  componentDidMount() {
    requests.map(request => this.props.dispatch(request(this.props)))
  }

  render() {
    return <Component {...this.props}/>
  }
});

export default LoadData;