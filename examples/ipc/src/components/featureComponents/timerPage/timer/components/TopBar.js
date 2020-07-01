/* eslint-disable react/prop-types */
/* eslint-disable no-redeclare */
/* eslint-disable max-len */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable block-scoped-var */
/* eslint-disable one-var */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
const __rest =
  (this && this.__rest) ||
  function(s, e) {
    const t = {};
    for (var p in s) {
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }
    if (s != null && typeof Object.getOwnPropertySymbols === 'function') {
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) {
          t[p[i]] = s[p[i]];
        }
      }
    }
    return t;
  };
const __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null) {
      for (const k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    }
    result.default = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const React = __importStar(require('react'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const theme_get_1 = require('../../theme/theme-get');

const { withTheme } = tuya_panel_kit_1.Utils.ThemeUtils;
const ThemedTopBar = props => {
  const { theme } = props,
    rest = __rest(props, ['theme']);
  const propsWithTheme = Object.assign(Object.assign({}, props), { theme });
  return (
    <tuya_panel_kit_1.TopBar
      background={theme_get_1.timer.titleBg(propsWithTheme)}
      color={theme_get_1.timer.titleFontColor(propsWithTheme)}
      {...rest}
    />
  );
};
exports.default = withTheme(ThemedTopBar);
