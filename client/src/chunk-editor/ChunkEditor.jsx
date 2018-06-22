import React from 'react';
import {compose, mapPropsStream, withRenderProps
  , renderComponent, mapProps, flattenProp} from 'recompose';
import {adopt} from 'react-adopt';
import * as rx from 'rxjs';
import * as op from 'rxjs/operators';
import {ChunkServiceCtx} from './ChunkService';
import _ from 'lodash';

export const ChunkEditor = (props) => {
  console.log('final props', props)
  const {value, increment, decrement, timer} = props;
  return (<div>
    timer {timer}
    <button onClick={increment}>increment</button>
    <button onClick={decrement}>decrement</button>
    total: {value}
  </div>)
}

const ctx2hoc = ((CtxConsumer, propName) => Component => props => 
  <CtxConsumer>
    {ctxValue => <Component {...props} {...{[propName]: ctxValue}}/>}
  </CtxConsumer>);

export default compose(
  ctx2hoc(ChunkServiceCtx.Consumer, 'chunkService')
  , mapPropsStream(props$ => {    
    return rx.combineLatest(
      props$.pipe(op.pluck('chunkService', 'counter$'), op.flatMap(_.identity))
      , props$.pipe(op.pluck('chunkService', 'timer$'), op.flatMap(_.identity))
      , (counter, timer) => {
        return ({
          counter
          , timer
        })
      }
    );
  })
)(ChunkEditor)

// const ServicesCtx = adopt({
//   chunkService: <ChunkServiceCtx.Consumer/>
// });
// 
// export default () => (
//   <ServicesCtx>
//     {ChunkEditor}
//   </ServicesCtx>
// );
