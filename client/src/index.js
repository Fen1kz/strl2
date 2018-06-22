import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { setObservableConfig } from 'recompose'
import {from} from 'rxjs';

setObservableConfig({
  fromESObservable: from
  , toESObservableObservable: stream => stream
});

window.React = React;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
