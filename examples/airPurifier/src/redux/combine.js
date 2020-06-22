import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as actionReducers } from './actions';

export const rootReducers = combineReducers({
  ...commonReducers,
  ...actionReducers,
});

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
