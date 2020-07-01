/* eslint-disable max-len */
/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-useless-constructor */
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

class Title extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const { title, position, textColor, style } = this.props;
    const textStyle = [
      { position: 'absolute', color: textColor, top: 0, left: 0 },
      position,
      style,
    ];
    if (typeof title === 'string') {
      return <react_native_1.Text style={textStyle}>{title}</react_native_1.Text>;
    }
    return title;
  }
}
exports.default = Title;
