/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
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

const styles = react_native_1.StyleSheet.create({
  xAxisStyle: {
    backgroundColor: 'transparent',
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: react_native_1.StyleSheet.hairlineWidth,
    borderTopColor: '#dbdbdb',
    justifyContent: 'space-between',
  },
  textStyle: {
    color: '#666',
    fontSize: 9,
  },
});
class XAxis extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getAlign = index => {
      const { xData } = this.props;
      if (index === 0) return 'left';
      if (index === xData.length - 1) return 'right';
      return 'center';
    };
  }
  render() {
    const { step, xData } = this.props;
    return (
      <react_native_1.View style={styles.xAxisStyle}>
        {xData.map((item, index) => {
          const textStyle = [
            styles.textStyle,
            {
              width: index === 0 || index === xData.length - 1 ? step / 2 : step,
              textAlign: this.getAlign(index),
            },
          ];
          if (React.isValidElement(item.label)) {
            return item.label;
          }
          return (
            <react_native_1.Text numberOfLines={1} key={`xAxis_${index}`} style={textStyle}>
              {item.data}
            </react_native_1.Text>
          );
        })}
      </react_native_1.View>
    );
  }
}
exports.default = XAxis;
