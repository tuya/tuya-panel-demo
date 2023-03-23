/* eslint-disable camelcase */
import { combineReducers } from 'redux';
import { reducers as commonReducers } from './modules/common';
import { reducers as themeReducers } from './modules/theme';

const reducers = {
  ...commonReducers,
  ...themeReducers,
};

export const rootReducers = combineReducers(reducers);
