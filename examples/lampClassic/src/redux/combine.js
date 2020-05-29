import { combineReducers } from 'redux';
import { reducers as commonReducers } from './modules/common';
import { reducers as cloudReducers } from './modules/cloud';

/* eslint-disable import/prefer-default-export */
export const rootReducers = combineReducers({
  ...commonReducers,
  ...cloudReducers,
});
