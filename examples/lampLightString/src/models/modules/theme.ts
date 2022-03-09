import { createAction, handleActions } from 'redux-actions';
import { defaultTheme, Utils, GlobalTheme } from 'tuya-panel-kit';
import { registerTheme as localTheme } from '../../config';

const { deepMerge } = Utils.ThemeUtils;

type ToggleThemePayload = { type: 'light' | 'dark' };
type UpdateThemePayload = GlobalTheme;

// Actions
const toggleTheme = createAction<ToggleThemePayload>('TOGGLE_THEME');
const updateTheme = createAction<UpdateThemePayload>('UPDATE_THEME');

export const actions = {
  toggleTheme,
  updateTheme,
};

export type Actions = { [K in keyof typeof actions]: ReturnType<typeof actions[K]> };

// Reducers
const theme = handleActions<GlobalTheme>(
  {
    [toggleTheme.toString()]: state => {
      return {
        ...state,
        type: state.type === 'light' ? 'dark' : 'light',
      };
    },
    [updateTheme.toString()]: (state, action) => deepMerge(state, action.payload) as GlobalTheme,
  },
  deepMerge(defaultTheme, localTheme) as GlobalTheme
);

export const reducers = {
  theme,
};
