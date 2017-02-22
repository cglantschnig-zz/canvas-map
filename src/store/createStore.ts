import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { browserHistory } from 'react-router';
import makeRootReducer from './reducers';

export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk];

  // ======================================================
  // Store Instantiation
  // ======================================================
  const store = createStore(
    (<any>makeRootReducer)(),
    initialState,
    compose(
      applyMiddleware(...middleware)
    )
  );

  (<any>store).asyncReducers = {};

  return store;
}
