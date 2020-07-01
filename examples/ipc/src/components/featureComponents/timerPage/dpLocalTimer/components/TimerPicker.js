/* eslint-disable max-len */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
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
    if (mod != null)
      for (const k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const native_1 = __importDefault(require('styled-components/native'));
const times_1 = __importDefault(require('lodash/times'));
const React = __importStar(require('react'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const theme_get_1 = require('../../theme/theme-get');

const { toFixed } = tuya_panel_kit_1.Utils.CoreUtils;
const { convertX: cx } = tuya_panel_kit_1.Utils.RatioUtils;
const StyledContainer = native_1.default.View`
  height: 200px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-left: ${cx(24)}px;
  padding-right: ${cx(24)}px;
  background-color: ${theme_get_1.timer.cellBg};
`;
const StyledContent = native_1.default.View`
  flex: 1;
  flex-direction: row;
`;
class TimerPicker extends React.Component {
  constructor(props) {
    super(props);
    this.minutes = times_1.default(60, n => ({
      value: n,
      label: toFixed(n, 2),
    }));
    this.prefixs = [
      { value: 'AM', label: 'AM' },
      { value: 'PM', label: 'PM' },
    ];
    this._handlePrefixChange = prefix => {
      const { is12Hours } = this.props;
      this.setState({ prefix });
      const h = is12Hours && prefix === 'PM' ? this.state.hour + 12 : this.state.hour;
      this.props.onTimerChange(h * 60 + this.state.minute);
    };
    this._handleHourChange = hour => {
      const { is12Hours } = this.props;
      this.setState({ hour: parseInt(hour) });
      const h = is12Hours && this.state.prefix === 'PM' ? parseInt(hour) + 12 : parseInt(hour);
      this.props.onTimerChange(h * 60 + this.state.minute);
    };
    this._handleMinuteChange = minute => {
      const { is12Hours } = this.props;
      this.setState({ minute: parseInt(minute) });
      const h = is12Hours && this.state.prefix === 'PM' ? this.state.hour + 12 : this.state.hour;
      this.props.onTimerChange(h * 60 + parseInt(minute));
    };
    const { is12Hours } = props;
    this.hours = is12Hours
      ? times_1.default(12, n => ({
          value: n,
          label: toFixed(n === 0 ? 12 : n, 2),
        }))
      : times_1.default(24, n => ({
          value: n,
          label: toFixed(n, 2),
        }));
    const hour = +props.hour;
    this.state = {
      prefix: hour >= 12 ? 'PM' : 'AM',
      hour: is12Hours && hour >= 12 ? hour - 12 : hour,
      minute: +props.minute,
    };
  }
  renderPickView({ style, values, value, onValueChange, loop, accessibilityLabel }) {
    const { isPickerAlignCenter = true } = this.props;
    if (values.length === 0 && !isPickerAlignCenter) {
      return null;
    }
    const { pickerFontColor } = this.props;
    return (
      <tuya_panel_kit_1.Picker
        accessibilityLabel={accessibilityLabel}
        selectedValue={value}
        onValueChange={onValueChange}
        contentContainerStyle={{ flex: 1 }}
        selectedItemTextColor={pickerFontColor}
        itemTextColor={pickerFontColor}
        itemStyle={[{ color: pickerFontColor, backgroundColor: 'transparent' }]}
        style={[
          {
            flex: 1,
            height: 200,
            backgroundColor: 'transparent',
            justifyContent: 'center',
          },
          style,
        ]}
        loop={loop}
      >
        {values.map((d, k) => (
          <tuya_panel_kit_1.Picker.Item key={k} value={d.value} label={d.label} />
        ))}
      </tuya_panel_kit_1.Picker>
    );
  }
  render() {
    const { accessibilityLabel = 'Timer_TimerPicker', is12Hours, loop } = this.props;
    return (
      <StyledContainer>
        <StyledContent>
          {this.renderPickView({
            values: [],
            value: '',
          })}
          {this.renderPickView({
            values: is12Hours ? this.prefixs : [],
            value: is12Hours ? this.state.prefix : '',
            onValueChange: this._handlePrefixChange,
            accessibilityLabel: `${accessibilityLabel}_Ampm`,
            loop: false,
          })}
          {this.renderPickView({
            values: this.hours,
            value: this.state.hour,
            onValueChange: this._handleHourChange,
            accessibilityLabel: `${accessibilityLabel}_Hour`,
            loop,
          })}
          {this.renderPickView({
            values: this.minutes,
            value: this.state.minute,
            onValueChange: this._handleMinuteChange,
            accessibilityLabel: `${accessibilityLabel}_Minute`,
            loop,
          })}

          {this.renderPickView({
            values: [],
            value: '',
          })}

          {this.renderPickView({
            values: [],
            value: '',
          })}
        </StyledContent>
      </StyledContainer>
    );
  }
}
exports.default = TimerPicker;
TimerPicker.defaultProps = {
  style: {},
  hour: 0,
  minute: 0,
  is12Hours: true,
  loop: false,
  pickerFontColor: '#333',
};
