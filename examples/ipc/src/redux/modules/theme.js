import { createAction, handleActions } from 'redux-actions';
import { defaultTheme, Utils } from 'tuya-panel-kit';
import { theme as localTheme } from '../../config';

const { deepMerge } = Utils.ThemeUtils;

// Actions
export const toggleTheme = createAction('TOGGLE_THEME');
export const updateTheme = createAction('UPDATE_THEME');

// Reducers
const theme = handleActions(
  {
    [toggleTheme.toString()]: state => {
      return {
        ...state,
        type: state.type === 'light' ? 'dark' : 'light',
      };
    },
    [updateTheme.toString()]: (state, action) => deepMerge(state, action.payload),
  },
  deepMerge(defaultTheme, localTheme)
);

export const reducers = {
  theme,
};
