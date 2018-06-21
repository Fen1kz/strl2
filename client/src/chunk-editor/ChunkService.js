import {of, interval, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

export default class ChunkService {
  constructor() {
    // this.counter$ = of(0);
    // this.updateValue$ = (obs)
    // this.onDec$
    this.interval$ = interval(1000)
      .pipe(
        tap(x => console.log(x))
      )
  }
  // loadChunks: () => fetch('localhost:8080/api/chunks');
}
