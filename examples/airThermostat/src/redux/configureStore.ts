import { createStore, applyMiddleware, compose, Middleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { rootReducers } from './combine';
import { setDispatch } from './actions';

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
const logger = createLogger({
  // eslint-disable-next-line no-unused-vars
  predicate: () => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

const middlewares: Middleware[] = [thunk];

if (isDebuggingInChrome) {
  middlewares.push(logger);
}

export default function configureStore(initialState: any) {
  const applyedMiddleware = applyMiddleware(...middlewares);

  const store = createStore(
    rootReducers,
    initialState,
    compose(
      applyedMiddleware,
      // @ts-ignore
      isDebuggingInChrome && window.devToolsExtension ? window.devToolsExtension() : (f: any) => f
    )
  );

  // 配置dispatch
  setDispatch(store.dispatch);

  return store;
}
