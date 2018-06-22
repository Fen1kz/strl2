import React from 'react';
import * as rx from 'rxjs';
import * as op from 'rxjs/operators';

export class ChunkService {
  constructor() {
    console.log('CONSTRUCTOR')
    this.counter$ = rx.of(0);
    // this.updateValue$ = (obs)
    // this.onDec$
    this.timer$ = rx.interval(5000)
      // .pipe(
      //   op.tap(x => console.log(x))
      // )
  }
  // loadChunks: () => fetch('localhost:8080/api/chunks');
}

export const ChunkServiceCtx = React.createContext(new ChunkService())
