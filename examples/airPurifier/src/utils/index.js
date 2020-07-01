import { Utils } from 'tuya-panel-kit';
import TYSdk from '../api';
import Strings from '../i18n';

const { NumberUtils } = Utils;

export const arrayToObject = arr => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign(...arr);
};

export const getFaultString = (faultCode, faultValue, onlyPrior = true) => {
  if (!faultValue) return '';
  const { label } = TYSdk.getDpSchema(faultCode);
  const labels = [];
  for (let i = 0; i < label.length; i++) {
    const value = label[i];
    const isExist = NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};
