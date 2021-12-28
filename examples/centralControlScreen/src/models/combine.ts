import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as VoiceSceneReducers } from './modules/voiceScene';
import { reducers as SceneReducers } from './modules/scene';
import { reducers as DeviceReducers } from './modules/device';
import { reducers as RoomReducers } from './modules/room';
import { reducers as SwitchReducers } from './modules/switch';

export const reducers = {
  ...commonReducers,
  ...VoiceSceneReducers,
  ...SceneReducers,
  ...DeviceReducers,
  ...RoomReducers,
  ...SwitchReducers,
};

type Reducers = typeof reducers;

export type ReduxState = { [K in keyof Reducers]: ReturnType<Reducers[K]> };

export const rootReducers = combineReducers(reducers);

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
