import { useSelector as useSelectorBase, shallowEqual } from 'react-redux';
import { actions as CommonActions } from './modules/common';
import { actions as VoiceSceneActions, getVoiceSceneList } from './modules/voiceScene';
import { actions as SceneActions, getSceneList } from './modules/scene';
import { actions as DeviceActions, getDeviceList } from './modules/device';
import { actions as RoomActions, getRoomList } from './modules/room';
import { actions as SwitchActions, getSwitchList, upDateSwitchName } from './modules/switch';
import { ReduxState } from './combine';
import configureStore from './configureStore';

export * from './combine';
export * from './configureStore';

const actions = {
  common: CommonActions,
  voiceScene: VoiceSceneActions,
  scene: SceneActions,
  device: DeviceActions,
  room: RoomActions,
  switch: SwitchActions,
  async: {
    getVoiceSceneList,
    getSceneList,
    getDeviceList,
    getRoomList,
    getSwitchList,
    upDateSwitchName,
  },
};

export { actions };

export const store = configureStore();

export function useSelector<TSelected>(
  selector: (state: ReduxState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return useSelectorBase<ReduxState, TSelected>(selector, equalityFn || shallowEqual);
}
