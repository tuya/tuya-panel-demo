import _ from 'lodash';
import { TYSdk, Utils, DevInfo } from 'tuya-panel-kit';
import { Dispatch } from 'redux';
import { bleManager } from '@utils';
import { actions, ThemeColor, UpdateDpStatePayload as UpdateDp, DpExist } from '../modules/common';

const { isIos } = Utils.RatioUtils;

let dispatch: Dispatch;
export const setDispatch = (d: Dispatch) => {
  dispatch = d;
};

export const devInfoChange = (data: DevInfo) => {
  dispatch(actions.devInfoChange(data));
};

export const deviceChange = (data: DevInfo) => {
  dispatch(actions.deviceChange(data));
};

export const updateDp = (data: UpdateDp) => {
  dispatch(actions.responseUpdateDp(data));
};

export const updateAppTheme = (data: ThemeColor) => {
  dispatch(actions.updateAppTheme(data));
};

export const existDpChange = (data: DpExist) => {
  dispatch(actions.existDpChange(data));
};

export const getOpenDoorDpIds = (data: number[]) => {
  dispatch(actions.getOpenDoorDpIds(data));
};

export const extraInfoChange = (data: any) => {
  dispatch(actions.extraInfoChange(data));
};

export const getBLEOnlineState = () => {
  try {
    const { devId } = TYSdk.devInfo;
    bleManager.getBLEOnlineState(devId, (res: any) => {
      const result = isIos ? res.state : res;
      dispatch(actions.getBleOnlineState(result === true));
    });
  } catch (e) {
    console.warn(e);
  }
};
