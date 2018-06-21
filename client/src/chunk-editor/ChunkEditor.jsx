import React, {PureComponent} from 'react';
import {mapPropsStream, compose} from 'recompose';
import {interval, pipe} from 'rxjs';
import * as op from 'rxjs/operators';

export const ChunkEditor = (props) => {
  // console.log(props)
  const {value, increment, decrement, timer} = props;
  return (<div>
    timer {timer}
    <button onClick={increment}>increment</button>
    <button onClick={decrement}>decrement</button>
    total: {value}
  </div>)
}

export default compose(
  mapPropsStream(props$ => {
    console.log('COMPOSED');
    const timer$ = interval(1000)
      .pipe(op.tap(x => console.log(x)));
    return props$
      .pipe(
        op.combineLatest(timer$
          , (props, timer) => ({
            ...props,
            timer
          })
        )
      )
  })
)(ChunkEditor);
