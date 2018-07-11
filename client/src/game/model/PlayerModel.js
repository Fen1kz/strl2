import _ from 'lodash';
import {Record} from 'immutable';
import Point from './Point';

export class PlayerModel extends Record({
  pos: new Point()
}) {
}

export default PlayerModel;
