import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as themeReducers } from './modules/theme';
import { reducers as ipcCommonReducers } from './modules/ipcCommon';

export const rootReducers = combineReducers({
  ...commonReducers,
  ...themeReducers,
  ...ipcCommonReducers,
});

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
