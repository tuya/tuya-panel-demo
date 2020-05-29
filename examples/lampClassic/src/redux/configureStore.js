import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
// import { createEpicMiddleware } from 'redux-observable';

import { rootReducers } from './combine';
// import rootEpics from './epics';

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
const logger = createLogger({
  // eslint-disable-next-line no-unused-vars
  predicate: (getState, action) => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

const middlewares = [
  thunk,
  // createEpicMiddleware(rootEpics),
];

if (isDebuggingInChrome) {
  middlewares.push(logger);
}

export default function configureStore(initialState) {
  const store = applyMiddleware(...middlewares)(createStore)(
    rootReducers,
    initialState,
    window.devToolsExtension && window.devToolsExtension()
  );

  if (module.hot) {
    module.hot.accept(() => {
      // eslint-disable-next-line global-require
      const { rootReducers: nextRootReducer } = require('./combine');
      store.replaceReducer(nextRootReducer);
    });
  }

  global.store = store;

  return store;
}
