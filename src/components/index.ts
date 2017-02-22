import { injectReducer } from '../store/reducers';
import MapContainer from './MapContainer';
import reducer from '../reducers/game';

export default function (store) {
  return {
    getComponent: (nextState, cb) => {
      injectReducer(store, { key: 'map', reducer });
      cb(null, MapContainer);
    }
  };
};
