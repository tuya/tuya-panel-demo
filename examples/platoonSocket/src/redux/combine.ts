import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as themeReducers } from './modules/theme';
import { reducers as cloudReducers } from './modules/cloudState';

export const rootReducers = combineReducers({
  ...commonReducers,
  ...themeReducers,
  ...cloudReducers,
});

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
