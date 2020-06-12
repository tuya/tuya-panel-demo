/* eslint-disable global-require */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
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
const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const React = __importStar(require('react'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const i18n_1 = __importDefault(require('../i18n'));
const style_1 = require('../timer/style');
const style_2 = require('./style');

const { convertX: cx, convertY: cy } = tuya_panel_kit_1.Utils.RatioUtils;
class RepeatCircle extends React.Component {
  constructor() {
    super(...arguments);
    this.onRepeatPress = index => {
      const selected = this.props.selected.split('');
      selected[index] = selected[index] === '1' ? '0' : '1';
      const newSelected = selected.join('');
      this.props.onSelect(newSelected);
    };
  }
  get weekData() {
    return Array(7)
      .fill(1)
      .map((_, index) => i18n_1.default.getLang(`day${index}`));
  }
  render() {
    const rowStyle = {
      marginTop: cy(34),
      marginBottom: cy(12),
      marginHorizontal: cx(24),
    };
    return (
      <style_1.Row style={rowStyle} justifyContent="space-between">
        {this.weekData.map((day, index) => {
          const selected = this.props.selected[index] === '1';
          return (
            <style_2.StyledRepeatCircleBorder
              key={index}
              accessibilityLabel={`Timer_RepeatCircle_${index}`}
              source={require('../res/circle.png')}
              selected={selected}
            >
              <style_2.StyledRepeatCircle
                selected={selected}
                activeOpacity={0.5}
                onPress={() => this.onRepeatPress(index)}
              >
                <style_2.StyledRepeatCircleText selected={selected}>
                  {day}
                </style_2.StyledRepeatCircleText>
              </style_2.StyledRepeatCircle>
            </style_2.StyledRepeatCircleBorder>
          );
        })}
      </style_1.Row>
    );
  }
}
exports.default = RepeatCircle;
