import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import * as thunk from 'redux-thunk';
import { browserHistory } from 'react-router';
import locationReducer from './location';

export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk.default];

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    combineReducers({
      location: locationReducer
    }),
    initialState,
    compose(
      applyMiddleware(...middleware)
    )
  );

  return store;
}
