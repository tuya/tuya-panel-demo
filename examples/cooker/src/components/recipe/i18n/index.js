import { I18N, Utils } from 'tuya-panel-kit';
import LocalStrings from './strings';
import Config from '../../../config';

const { NumberUtils } = Utils;
const Strings = new I18N(LocalStrings);

// Strings.applyStrings(LocalStrings);

Strings.getFaultStrings = (faultCode, faultValue, onlyPrior = true) => {
  const { label } = Config.getDpSchema(faultCode);
  const labels = [];
  for (let i = 0; i < label.length; i++) {
    const value = label[i];
    const isExist = NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels;
};

export default Strings;
