import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';

export const rootReducers = combineReducers({
  ...commonReducers,
});

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
