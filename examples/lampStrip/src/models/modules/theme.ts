import { createAction, handleActions } from 'redux-actions';
import { defaultTheme, Utils, GlobalTheme } from 'tuya-panel-kit';
import { registerTheme as localTheme } from '@config';

const { deepMerge } = Utils.ThemeUtils;

type UpdateThemePayload = GlobalTheme;

// Actions
const updateTheme = createAction<UpdateThemePayload>('UPDATE_THEME');

export const actions = {
  updateTheme,
};

export type Actions = { [K in keyof typeof actions]: ReturnType<typeof actions[K]> };

// Reducers
const theme = handleActions<GlobalTheme>(
  {
    [updateTheme.toString()]: (state, action) => deepMerge(state, action.payload) as GlobalTheme,
  },
  deepMerge(defaultTheme, localTheme) as GlobalTheme
);

export const reducers = {
  theme,
};
