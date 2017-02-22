
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import location from '../reducers/location';
import game from '../reducers/game';

export const makeRootReducer = (asyncReducers): any => {
  return combineReducers({
    router,
    location,
    game
  });
};

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
