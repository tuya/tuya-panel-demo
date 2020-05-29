import { I18N, Utils } from 'tuya-panel-kit';
import Config from '../config';
import localStrings from './strings';

const Strings = new I18N(localStrings);

Strings.getFaultStrings = (faultCode, faultValue, onlyPrior = true) => {
  const { label = [] } = Config.getDpSchema(faultCode);
  const labels = [];
  for (let i = 0; i < label.length; i++) {
    const value = label[i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels;
};

module.exports = Strings;
