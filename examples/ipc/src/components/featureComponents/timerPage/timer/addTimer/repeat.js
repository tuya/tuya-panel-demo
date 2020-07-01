/* eslint-disable global-require */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
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
const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const React = __importStar(require('react'));
const i18n_1 = __importDefault(require('../i18n'));
const style_1 = require('./style');

class Repeat extends React.Component {
  constructor(props) {
    super(props);
    this.onRowPress = index => {
      const selected = this.state.selected.split('');
      selected[index] = selected[index] === '1' ? '0' : '1';
      const newSelected = selected.join('');
      this.setState({ selected: newSelected });
      this.props.onSelect && this.props.onSelect(newSelected);
    };
    this.state = {
      selected: props.selected || '0000000',
    };
  }
  render() {
    const { selected } = this.state;
    const weekData = Array(7)
      .fill(1)
      .map((_, index) => i18n_1.default.getLang(`day${index}`));
    return (
      <style_1.StyledRepeatContent>
        {weekData.map((day, index) => (
          <style_1.StyledRepeatRow
            key={index + 1}
            accessibilityLabel={`Timer_Repeat_Week${index}`}
            activeOpacity={0.5}
            onPress={() => this.onRowPress(index)}
          >
            <style_1.StyledRepeatText>{day}</style_1.StyledRepeatText>
            {selected[index] === '1' && (
              <style_1.StyledRepeatImage source={require('../res/selected.png')} />
            )}
          </style_1.StyledRepeatRow>
        ))}
      </style_1.StyledRepeatContent>
    );
  }
}
exports.default = Repeat;
