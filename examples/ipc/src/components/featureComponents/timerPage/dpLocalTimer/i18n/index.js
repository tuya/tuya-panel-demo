/* eslint-disable camelcase */
Object.defineProperty(exports, '__esModule', { value: true });
const tuya_panel_kit_1 = require('tuya-panel-kit');
const Strings = require('./string').default;

const TimerI18N = class extends tuya_panel_kit_1.I18N {
  getLang(key, defaultString) {
    // this.sendToSentry(`TYTimer_${key}`);
    return super.getLang(`TYTimer_${key}`, defaultString);
  }
  formatValue(key, ...values) {
    return super.formatValue(`TYTimer_${key}`, ...values);
  }
};
module.exports = new TimerI18N(Strings);
