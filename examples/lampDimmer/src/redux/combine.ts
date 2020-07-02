import { combineReducers } from 'redux';
import { reducers as commonReducers } from './modules/common';
import { reducers as cloudReducers } from './modules/cloud';

export const rootReducers = combineReducers({
  ...commonReducers,
  ...cloudReducers,
});
