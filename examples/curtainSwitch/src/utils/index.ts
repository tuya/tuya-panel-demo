/* eslint-disable import/prefer-default-export */
import _times from 'lodash/times';
import _filter from 'lodash/filter';
import { Utils, TYSdk } from 'tuya-panel-kit';
import { store } from '../models';
import Strings from '../i18n';

const { convertX: cx } = Utils.RatioUtils;
const TYDevice = TYSdk.device;

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: any = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};

export const arrayToObject = (arr: any) => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign(...arr);
};

export function handleError(error: Error) {
  console.warn(error.message || error);
}

export const DELAY = [200, 400, 600];
export const DURTION = [900, 700, 500];
export const DELAY2 = [600, 400, 200];
export const DURTION2 = [500, 700, 900];
export const ACTIVEOPACITY = 0.9;

export const getCodes = (code: string, lightMode?: string, switchBacklight?: string) => {
  const back = code.replace(/control/, 'control_back');
  const calibte = code.replace(/control/, 'cur_calibration');
  const machinery = code.replace(/control/, 'elec_machinery_mode');
  const time = code.replace(/control/, 'tr_timecon');
  const arr = [lightMode, switchBacklight, back, calibte, machinery, time];
  const useCodes = _filter(arr, (item: string) => !!TYDevice.checkDpExist(item));
  return useCodes;
};

export const getDataOptions = (d: string, dpState: any, code: string, disable: boolean) => {
  const schema = TYDevice.getDpSchema(d);
  const { type } = schema;
  const isBack = d.slice(0, 12) === 'control_back';
  const isBool = type === 'bool' || isBack;
  const val = dpState[d];
  const isCur = code.slice(0, 15) === 'cur_calibration';
  const relevantCode = isCur || isBool;
  const isEle = code.slice(0, 19) === 'elec_machinery_mode';
  return {
    key: d,
    title: Strings.getDpLang(d),
    arrow: !isBool,
    disable: relevantCode && disable,
    value: isBack && schema.range ? val === schema.range[0] : val,
    valueTxt: isEle ? Strings.getDpLang(d, val) : '',
    isBool,
    val,
    // onPress: isBool ? (value: boolean) => this._handleToggle(d, value) : () => this._handleToGoList(d, val)
  };
};

export const getDisable = (rangeState: number, percent: number, isStopState: boolean) => {
  let disabled = false;
  switch (rangeState) {
    case 0:
      disabled = isStopState && percent === 100;
      break;
    case 1:
      disabled = false;
      break;
    case 2:
      disabled = isStopState && percent === 0;
      break;
    default:
      break;
  }
  return disabled;
};
