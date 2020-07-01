/* eslint-disable max-len */
/* eslint-disable one-var */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */

const __rest =
  (this && this.__rest) ||
  function(s, e) {
    const t = {};
    for (const p in s) {
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }
    if (s != null && typeof Object.getOwnPropertySymbols === 'function') {
      for (let i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) {
          t[p[i]] = s[p[i]];
        }
      }
    }
    return t;
  };
const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
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
const color_1 = __importDefault(require('color'));
const React = __importStar(require('react'));
const react_native_1 = require('react-native');
const native_1 = __importDefault(require('styled-components/native'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const style_1 = require('../timer/style');

exports.StyledContainer = style_1.StyledContainer;
exports.StyledCell = style_1.StyledCell;
exports.StyledTitle = style_1.StyledTitle;
exports.StyledDivider = style_1.StyledDivider;
const theme_get_1 = require('../../theme/theme-get');
const components_1 = require('../components');
const timer_picker_1 = __importDefault(require('../../timer-picker'));

const { convertX: cx, width } = tuya_panel_kit_1.Utils.RatioUtils;
const { ThemeConsumer } = tuya_panel_kit_1.Utils.ThemeUtils;
exports.StyledSubTitle = native_1.default(style_1.StyledSubTitle)`
  text-align: right;
  font-size: ${cx(15)}px;
`;
exports.StyledIcon = props => {
  const { style } = props,
    rest = __rest(props, ['style']);
  return (
    <ThemeConsumer>
      {theme => {
        const propsWithTheme = Object.assign(Object.assign({}, props), { theme });
        return (
          <tuya_panel_kit_1.IconFont
            style={[{ marginLeft: cx(8) }, style]}
            color={theme_get_1.timer.subFontColor(propsWithTheme)}
            useART={true}
            {...rest}
          />
        );
      }}
    </ThemeConsumer>
  );
};
exports.StyledRepeatContent = native_1.default.View`
  background-color: #fff;
`;
exports.StyledRepeatRow = native_1.default.TouchableOpacity`
  min-height: ${cx(48)}px;
  border-bottom-width: ${react_native_1.StyleSheet.hairlineWidth};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-color: #ddd;
`;
exports.StyledRepeatImage = native_1.default.Image`
  position: absolute;
  right: ${cx(16)}px;
  tint-color: ${theme_get_1.timer.repeatColor};
`;
exports.StyledRepeatText = native_1.default(tuya_panel_kit_1.TYText)`
  font-size: ${cx(14)}px;
  color: ${props => props.color || '#303030'};
`;
exports.StyledRepeatCircleBorder = native_1.default.ImageBackground.attrs({
  imageStyle: props => {
    const c = color_1.default(theme_get_1.timer.subFontColor(props));
    c.values.alpha *= 0.5;
    const borderColor = c.rgbString();
    return { tintColor: props.selected ? 'transparent' : borderColor };
  },
})`
  width: ${cx(40)}px;
  height: ${cx(40)}px;
  align-items: center;
  justify-content: center;
`;
exports.StyledRepeatCircle = native_1.default.TouchableOpacity`
  width: ${cx(40)}px;
  height: ${cx(40)}px;
  align-items: center;
  justify-content: center;
  border-radius: ${cx(20)}px;
  background-color: ${props =>
    props.selected ? theme_get_1.timer.repeatColor(props) : 'transparent'};
`;
exports.StyledRepeatCircleText = native_1.default(tuya_panel_kit_1.TYText).attrs({
  numberOfLines: 1,
})`
  font-size: ${cx(12)}px;
  background-color: transparent;
  color: ${props => (props.selected ? '#fff' : theme_get_1.timer.subFontColor(props))};
`;
exports.StyledTimeZone = native_1.default.View`
  background-color: ${theme_get_1.timer.cellBg};
`;
exports.StyledTimeZoneHeader = native_1.default.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  background-color: ${theme_get_1.timer.cellBg};
`;
exports.StyledTimeZoneItem = native_1.default.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
exports.StyledTimeZoneText = native_1.default(tuya_panel_kit_1.TYText)`
  font-size: 14px;
  color: ${props =>
    props.secondary ? theme_get_1.timer.subFontColor(props) : theme_get_1.timer.fontColor(props)};
`;
exports.StyledTimeZoneTitle = native_1.default(tuya_panel_kit_1.TYText)`
  font-weight: 500;
  font-size: 32px;
  color: ${theme_get_1.timer.fontColor};
`;
exports.StyledTimeZoneSymbol = native_1.default.View`
  position: absolute;
  left: ${(width - cx(24)) / 2};
  width: ${cx(24)}px;
  height: 2;
  background-color: ${theme_get_1.timer.subFontColor};
`;
exports.StyledTimerPointPicker = props => {
  return (
    <ThemeConsumer>
      {theme => {
        const propsWithTheme = Object.assign(Object.assign({}, props), { theme });
        return (
          <components_1.TimerPicker
            pickerFontColor={theme_get_1.timer.fontColor(propsWithTheme)}
            {...props}
          />
        );
      }}
    </ThemeConsumer>
  );
};
exports.StyledTimerRangePicker = props => {
  return (
    <ThemeConsumer>
      {theme => {
        const propsWithTheme = Object.assign(Object.assign({}, props), { theme });
        return (
          <timer_picker_1.default
            style={{ height: 200, backgroundColor: theme_get_1.timer.cellBg(propsWithTheme) }}
            pickerFontColor={theme_get_1.timer.fontColor(propsWithTheme)}
            {...props}
          />
        );
      }}
    </ThemeConsumer>
  );
};
exports.StyledNoticeItem = props => {
  return (
    <ThemeConsumer>
      {theme => {
        const propsWithTheme = Object.assign(Object.assign({}, props), { theme });
        return (
          <tuya_panel_kit_1.TYFlatList.SwitchItem
            styles={{
              container: { backgroundColor: theme_get_1.timer.cellBg(propsWithTheme) },
              title: { fontSize: cx(17), color: theme_get_1.timer.fontColor(propsWithTheme) },
            }}
            thumbTintColor={theme_get_1.timer.thumbTintColor(propsWithTheme)}
            onThumbTintColor={theme_get_1.timer.onThumbTintColor(propsWithTheme)}
            onTintColor={theme_get_1.timer.onTintColor(propsWithTheme)}
            tintColor={theme_get_1.timer.tintColor(propsWithTheme)}
            {...props}
          />
        );
      }}
    </ThemeConsumer>
  );
};
