import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as recordsReducers } from './modules/records';

export const rootReducers = combineReducers({
  ...commonReducers,
  ...recordsReducers,
});

const allEpics = [...commonEpics, ...recordsReducers];

export const rootEpics = combineEpics(...allEpics);
