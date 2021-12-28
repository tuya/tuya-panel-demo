import { handleActions, createAction } from 'redux-actions';
import _ from 'lodash';
import { TYSdk } from 'tuya-panel-kit';
import { isValidSwitchDp } from '@utils';
import Strings from '@i18n';
import { commonApi } from '@tuya/tuya-panel-api';

const { getDpsInfos, updateDpName } = commonApi.deviceApi;

const saveSwitchList = createAction('SAVE_SWITCH_INFO');

const switchList = handleActions(
  {
    [saveSwitchList.toString()]: (state, action) => action.payload,
  },
  []
);

export const actions = {
  saveSwitchList,
};

export const reducers = {
  switchList,
};

export const getSwitchList = () => async dispatch => {
  try {
    const res: any[] = [];
    const dpsInfo = await getDpsInfos({ gwId: TYSdk.devInfo.devId, devId: TYSdk.devInfo.devId });
    const switchDpsInfo = dpsInfo.filter(d => isValidSwitchDp(d.code));
    switchDpsInfo.forEach(({ name, code }) => {
      res.push({ name: name || Strings.getDpLang(code), code });
    });
    dispatch(saveSwitchList(res));
  } catch (err) {
    console.log(err);
  }
};

export const upDateSwitchName = (code: string, name: string) => async dispatch => {
  try {
    const dpId = TYSdk.device.getDpIdByCode(code);
    await updateDpName({ gwId: TYSdk.devInfo.devId, devId: TYSdk.devInfo.devId, dpId, name });
  } catch (err) {
    console.log(err);
  }
};
