/* eslint-disable max-len */
/* eslint-disable react/prop-types */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
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

const { convertY: cy, convertX: cx } = tuya_panel_kit_1.Utils.RatioUtils;
const styles = react_native_1.StyleSheet.create({
  tooltipContainerStyle: {
    position: 'absolute',
    flexDirection: 'row',
    top: 0,
    bottom: 0,
  },
  tooltipWrapperStyle: {
    width: cx(102),
    height: cy(48),
    paddingLeft: cx(6),
    justifyContent: 'center',
    position: 'absolute',
  },
  tooltipTextStyle: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 20,
  },
});
class Tooltip extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getElement = () => {
      const { yPoint, xPoint, textStyle, title, content } = this.props;
      if (content) return content(xPoint, yPoint);
      const tooltipTextStyle = [styles.tooltipTextStyle, textStyle];
      const xLabel = xPoint
        ? typeof xPoint.label === 'string'
          ? xPoint.label
          : `${xPoint.data}${xPoint.unit || ''}`
        : '';
      const yTitle = title ? `${title}:` : '';
      const yLabel = `${yTitle}${
        typeof yPoint.label === 'string' ? yPoint.label : `${yPoint.data}${yPoint.unit || ''}`
      }`;
      return (
        <react_native_1.View>
          {xLabel && <react_native_1.Text style={tooltipTextStyle}>{xLabel}</react_native_1.Text>}
          {yLabel && <react_native_1.Text style={tooltipTextStyle}>{yLabel}</react_native_1.Text>}
        </react_native_1.View>
      );
    };
  }
  render() {
    const { right, background, chartWidth, chartHeight, distance, style } = this.props;
    // tooltip
    const showRight = chartWidth - right > cx(102);
    const pos = showRight ? { right: cx(4) } : { left: cx(4) };
    const toolTipStyle = [
      styles.tooltipWrapperStyle,
      Object.assign({ backgroundColor: background }, pos),
      style,
    ];
    return (
      <react_native_1.View
        style={[styles.tooltipContainerStyle, { right, top: chartHeight * distance }]}
      >
        <react_native_1.View style={toolTipStyle}>{this.getElement()}</react_native_1.View>
      </react_native_1.View>
    );
  }
}
Tooltip.defaultProps = {
  direction: 'right',
};
exports.default = Tooltip;
