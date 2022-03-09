// eslint-disable-next-line import/no-unresolved
import { SmearDataType, HomeTab, DimmerMode, SmearMode, DimmerValue, SceneDataType } from '@types';

import { reducers as commonReducers } from './modules/common';
import { reducers as themeReducers } from './modules/theme';

const reducers = {
  ...commonReducers,
  ...themeReducers,
};

type Reducers = typeof reducers;

export type ReduxState = { [K in keyof Reducers]: ReturnType<Reducers[K]> };

export type GetState = () => ReduxState;

export interface DpState {
  switch: boolean;
  paint_colour_data?: SmearDataType;
  [dpCode: string]: any;
}

export interface UiState {
  homeTab: HomeTab;
  scenes: SceneDataType[];
  presetScenes: SceneDataType[];
  totalCountdown: number;
  dimmerMode: DimmerMode;
  dimmerValue: DimmerValue;
  smearMode: SmearMode;
  ledNumber: number;
  cloudTimingList: any[];
  afterSmearAll: boolean;
  afterSmearAllWhite: boolean;
}

export type UiStatePayload = Partial<UiState>;
