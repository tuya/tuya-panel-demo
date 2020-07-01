/* eslint-disable max-len */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
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
const react_native_1 = require('react-native');
const tuya_panel_kit_1 = require('tuya-panel-kit');
const theme_get_1 = require('../../theme/theme-get');
const style_1 = require('./style');

const { convertX: cx } = tuya_panel_kit_1.Utils.RatioUtils;
const TimerCell = props => {
  const {
    accessibilityLabel,
    style,
    timeStr,
    tagStr,
    repeatStr,
    switchValue,
    onLongPress,
    onPress,
    dpStr,
    switchChange,
    rightItem,
    bordered,
  } = props;
  const titleStyle = [{ paddingBottom: 6 }, !switchValue && { opacity: 0.5 }];
  const subTitleStyle = [{ paddingBottom: 3 }, !switchValue && { opacity: 0.5 }];
  return (
    <style_1.StyledCell style={[{ paddingTop: cx(14) }, style]}>
      <react_native_1.TouchableOpacity
        style={{ flex: 1, justifyContent: 'center' }}
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.8}
        onLongPress={onLongPress}
        onPress={onPress}
      >
        <style_1.StyledTitle style={titleStyle}>{timeStr}</style_1.StyledTitle>
        {!!tagStr && (
          <style_1.StyledSubTitle style={subTitleStyle} numberOfLines={1}>
            {tagStr}
          </style_1.StyledSubTitle>
        )}
        {!!repeatStr && (
          <style_1.StyledSubTitle style={subTitleStyle} numberOfLines={1}>
            {repeatStr}
          </style_1.StyledSubTitle>
        )}
        {!!dpStr && <style_1.StyledSubTitle style={subTitleStyle}>{dpStr}</style_1.StyledSubTitle>}
      </react_native_1.TouchableOpacity>
      <react_native_1.View style={{ marginLeft: cx(16) }}>
        {rightItem === 'switch' ? (
          <tuya_panel_kit_1.SwitchButton
            accessibilityLabel={`${accessibilityLabel}_Switch`}
            value={switchValue}
            onValueChange={value => {
              switchChange(value);
            }}
            thumbTintColor={theme_get_1.timer.thumbTintColor(props)}
            onThumbTintColor={theme_get_1.timer.onThumbTintColor(props)}
            onTintColor={theme_get_1.timer.onTintColor(props)}
            tintColor={theme_get_1.timer.tintColor(props)}
          />
        ) : (
          <tuya_panel_kit_1.Icon
            name="icon-dp_right"
            color={theme_get_1.timer.subFontColor(props)}
            size={18}
          />
        )}
      </react_native_1.View>
      {!!bordered && (
        <style_1.StyledDivider style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      )}
    </style_1.StyledCell>
  );
};
exports.default = TimerCell;
