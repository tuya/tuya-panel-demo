import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as switchReducers } from './modules/switchState';

export const rootReducers = combineReducers({
  ...commonReducers,
  ...switchReducers,
});

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
