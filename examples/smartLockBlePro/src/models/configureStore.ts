import { createStore, applyMiddleware, compose, Store } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { setDispatch } from './actions';
import { rootReducers, ReduxState } from './combine';

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
const logger = createLogger({
  predicate: () => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

const middleware = isDebuggingInChrome ? [thunk, logger] : [thunk];

let store: Store<ReduxState>;

export const getState = () => {
  return store.getState();
};

export default function configureStore(initialState?: Partial<ReduxState>) {
  const appliedMiddleware = applyMiddleware(...middleware);

  store = createStore(
    rootReducers,
    initialState,
    compose(
      appliedMiddleware,
      isDebuggingInChrome && window.devToolsExtension ? window.devToolsExtension() : (f: any) => f
    )
  );

  setDispatch(store.dispatch);
  return store;
}
