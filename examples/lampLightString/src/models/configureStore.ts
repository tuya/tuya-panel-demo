/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';
import { rootEpics, rootReducers, ReduxState } from './combine';

const epicMiddleware = createEpicMiddleware();

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
const logger = createLogger({
  predicate: () => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

const middleware = isDebuggingInChrome ? [thunk, logger] : [thunk];

export default function configureStore(initialState?: Partial<ReduxState>) {
  const appliedMiddleware = applyMiddleware(...middleware);

  const store = createStore(
    rootReducers,
    initialState,
    compose(
      appliedMiddleware,
      // @ts-ignore
      isDebuggingInChrome && window.devToolsExtension ? window.devToolsExtension() : (f: any) => f
    )
  );

  epicMiddleware.run(rootEpics);
  return store;
}
