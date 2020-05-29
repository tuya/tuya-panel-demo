import { combineReducers } from 'redux';
import { reducers as commonReducers } from './modules/common';

/* eslint-disable import/prefer-default-export */
export const rootReducers = combineReducers({
  ...commonReducers,
});
