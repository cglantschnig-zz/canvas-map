import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { browserHistory } from 'react-router';
import locationReducer from '../reducers/location';
import gameReducer from '../reducers/location';

export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk];

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    combineReducers({
      location: locationReducer,
      game: gameReducer
    }),
    initialState,
    compose(
      applyMiddleware(...middleware)
    )
  );

  return store;
}
