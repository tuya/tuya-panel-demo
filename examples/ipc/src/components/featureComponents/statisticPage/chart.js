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
/* eslint-disable */
const React = __importStar(require('react'));
const react_native_1 = require('react-native');
const utils_1 = require('./utils');
const react_native_svg_1 = __importStar(require('react-native-svg'));
const tuya_panel_kit_1 = require('tuya-panel-kit');
const tooltip_1 = __importDefault(require('./tooltip'));
const xAxis_1 = __importDefault(require('./xAxis'));
const title_1 = __importDefault(require('./title'));
const DeviceWidth = react_native_1.Dimensions.get('window').width;
const { convertY: cy } = tuya_panel_kit_1.Utils.RatioUtils;
const ChartWidth = DeviceWidth - 32;
const ChartHeight = cy(240) - cy(40) * 2;
const SvgMax = 0.6;
const SvgMin = 0.8;
const Distance = 0.08;
class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.adjustIndex = (event, gestureState) => {
      let points = this.props.yData.filter(it => typeof it.data === 'number');
      const pl = points.length;
      const pointsXAxisData = points.map((_, index) => (index * this.chartWidth) / (pl - 1));
      const { x0, dx } = gestureState;
      let num = 0;
      if (react_native_1.Dimensions.get('window').width - this.chartWidth >= 0) {
        num = x0 + dx - cy((react_native_1.Dimensions.get('window').width - this.chartWidth) / 2);
      } else {
        num = event.nativeEvent.locationX;
      }
      if (num < 0) {
        this.setState({ index: 0 });
        return;
      }
      pointsXAxisData.reduce((prev, curr, index) => {
        if (num >= prev && num <= curr) {
          if (num - prev <= curr - num) {
            this.setState({ index: index - 1 });
          } else {
            this.setState({ index });
          }
        }
        return curr;
      });
    };
    this.getCurvePath = (pointsInChart, FullChartWidth) => {
      const { line, hasCircle, hasShadow } = this.props;
      const { dotRadius = 3, width = 2 } = line;
      const circleRadius = hasCircle ? dotRadius : 0;
      const circleAddWidth = hasCircle ? width + circleRadius : 0;
      let path = '';
      pointsInChart.reduce((prev, current, index) => {
        const ctrlP = utils_1.getCtrlPoint(pointsInChart, index - 1, 1, 0);
        if (index == 1) {
          path = `M ${prev.x},${prev.y}`;
        }
        path = `${path} C ${ctrlP.pA.x},${ctrlP.pA.y} ${ctrlP.pB.x},${ctrlP.pB.y} ${current.x},${current.y}`;
        return current;
      });
      const lastPoint = pointsInChart[pointsInChart.length - 1];
      if (!hasShadow) return path;
      path = `${path}
      M ${lastPoint.x + circleAddWidth + 2}, ${lastPoint.y}
      L ${FullChartWidth + 2},${this.chartHeight + 2}
      L -2 ,${this.chartHeight + 2}
      L ${pointsInChart[0].x - circleAddWidth - 2}, ${pointsInChart[0].y}`;
      return path;
    };
    this.getDashLineY = (param, yMax, yMin) => {
      const { type, custom } = param;
      const gap = this.chartHeight * SvgMin - this.chartHeight * SvgMax;
      let y = this.chartHeight * SvgMin - gap / 2;
      let value = (yMax - (yMax - yMin) / 2).toString();
      switch (type) {
        case 'min':
          y = this.chartHeight * SvgMin;
          value = yMin.toFixed(param.fixed === undefined ? 2 : param.fixed);
          break;
        case 'max':
          y = this.chartHeight * SvgMax;
          value = yMax.toFixed(param.fixed === undefined ? 2 : param.fixed);
          break;
        case 'custom':
          const tempY =
            custom !== undefined
              ? (1 - (custom - yMin) / (yMax - yMin)) * gap + this.chartHeight * SvgMax
              : y;
          y = Math.min(Math.max(tempY, 0), this.chartHeight);
          value = custom !== undefined ? custom.toString() : value;
          break;
        default:
          break;
      }
      return {
        y,
        value,
      };
    };
    this.getDashLine = (yMax, yMin, FullChartWidth) => {
      const { dashLine } = this.props;
      if (!dashLine || !dashLine.dashLineConfig) return null;
      if (!dashLine.show) return null;
      let yShowText = [];
      const dashPath = dashLine.dashLineConfig.reduce((prev, current, index) => {
        const { y: chartYAxis, value: showText } = this.getDashLineY(current, yMax, yMin);
        const showTextStyle = {
          position: 'absolute',
          right: 0,
          bottom: this.chartHeight - chartYAxis + 2,
          textAlign: 'right',
          color: '#999',
          fontSize: 10,
        };
        yShowText.push(
          <react_native_1.Text
            style={showTextStyle}
            key={`yshowText_${index}`}
          >{`${showText}${dashLine.unit || ''}`}</react_native_1.Text>
        );
        return `${prev} M 0 ${chartYAxis} L${FullChartWidth} ${chartYAxis}`;
      }, '');
      return {
        dashline: (
          <react_native_svg_1.Path
            d={dashPath}
            stroke={dashLine.color}
            strokeWidth="1"
            strokeDasharray="2,4"
            id="dashline"
          />
        ),
        showText: yShowText,
      };
    };
    this.getFlagPath = pointsInChart => {
      const { line, hasCircle } = this.props;
      const { dotRadius = 3, width = 2 } = line;
      const circleRadius = hasCircle ? dotRadius : 0;
      const index = this.state.index;
      const currentPoint = pointsInChart[index];
      return `M ${currentPoint.x}, ${this.chartHeight * Distance}
        L ${currentPoint.x}, ${currentPoint.y - circleRadius - width}
        M ${currentPoint.x}, ${currentPoint.y + circleRadius + width}
        L ${currentPoint.x}, ${this.chartHeight}`;
    };
    this.panResponder = react_native_1.PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      // 处理x轴滑动
      onPanResponderTerminationRequest: () => true,
      onPanResponderGrant: this.adjustIndex,
      onPanResponderMove: this.adjustIndex,
      onPanResponderRelease: () => {
        return false;
      },
      onPanResponderTerminate: () => {
        return false;
      },
    });
    const { yData } = this.props;
    let index;
    if (yData.length % 2 == 0) {
      index = yData.length / 2 - 1;
    } else {
      index = (yData.length - 1) / 2;
    }
    // 表示当前指示牌掉落在第几个点的位置
    this.state = { index };
    this.chartWidth = props.chartWidth || ChartWidth;
    this.chartHeight = props.chartHeight || ChartHeight;
  }
  componentWillReceiveProps(nextProps) {
    const points = nextProps.yData;
    if (points) {
      let index;
      if (points.length % 2 == 0) {
        index = points.length / 2 - 1;
      } else {
        index = (points.length - 1) / 2;
      }
      this.setState({ index });
    }
    this.chartWidth = nextProps.chartWidth || ChartWidth;
    this.chartHeight = nextProps.chartHeight || ChartHeight;
  }
  render() {
    const {
      line,
      dashLine,
      hasShadow,
      hasCircle,
      tooltip,
      title,
      style,
      xData,
      yMax,
      yMin,
      activeCircle,
    } = this.props;
    const { dotRadius = 3, width = 2, color = '#49BBFF' } = line;
    let dataSource = this.props.yData;
    if (!dataSource || dataSource.length <= 1) {
      return <react_native_1.View style={styles.container} />;
    }
    dataSource = dataSource.filter(it => typeof it.data === 'number');
    const data = dataSource.map(it => it.data);
    // const data = [23.02, 64.03, 19, 52.05, 12.05, 92.05, 9.05];
    if (!data || data.length <= 1) {
      return <react_native_1.View style={styles.container} />;
    }
    const circleRadius = hasCircle ? dotRadius : 0;
    const circleAddWidth = hasCircle ? width + circleRadius : 0;
    const FullChartWidth = this.chartWidth;
    const max = yMax;
    const min = yMin > 0 ? 0 : yMin;
    const isLine = max - min == 0; // 最大值 = 最小值 的时候, 就是一条直线
    const y1 = this.chartHeight * SvgMax,
      y2 = this.chartHeight * SvgMin;
    const gap = y2 - y1;
    const step = (FullChartWidth - 2 * circleAddWidth) / (data.length - 1);
    const pointsInChart = data.map((it, index) => ({
      // 将真实数据映射到坐标系之内
      x: index * step + circleAddWidth,
      y: isLine ? y2 : (1 - (it - min) / (max - min)) * gap + y1,
    }));
    const curvePath = this.getCurvePath(pointsInChart, FullChartWidth);
    const lineColor = color;
    // dashline
    const customDashLine = this.getDashLine(max, min, FullChartWidth);
    // tooltip
    const right = FullChartWidth - this.state.index * step - circleAddWidth;
    // title
    return (
      <react_native_1.View style={[styles.container, style]} {...this.panResponder.panHandlers}>
        <react_native_1.View>
          <react_native_1.View>
            <react_native_svg_1.default width={FullChartWidth} height={this.chartHeight}>
              <react_native_svg_1.Defs>
                <react_native_svg_1.Path
                  id="line"
                  d={curvePath}
                  stroke={lineColor}
                  strokeWidth="2"
                  fill={hasShadow ? 'url(#shadow)' : 'none'}
                />
                {customDashLine ? customDashLine.dashline : null}
                {tooltip && tooltip.show ? (
                  <react_native_svg_1.Path
                    id="flag"
                    d={this.getFlagPath(pointsInChart)}
                    stroke="#EEEEEE"
                    strokeWidth="1"
                  />
                ) : null}
                {hasShadow ? (
                  <react_native_svg_1.LinearGradient
                    x1="50%"
                    y1="100%"
                    x2="50%"
                    y2="0%"
                    id="shadow"
                  >
                    <react_native_svg_1.Stop
                      stopColor={lineColor}
                      stopOpacity="0"
                      offset="0%"
                    ></react_native_svg_1.Stop>
                    <react_native_svg_1.Stop
                      stopColor={lineColor}
                      stopOpacity="0.100713315"
                      offset="100%"
                    ></react_native_svg_1.Stop>
                  </react_native_svg_1.LinearGradient>
                ) : null}
              </react_native_svg_1.Defs>
              <react_native_svg_1.G>
                <react_native_svg_1.Use href="#line" />
                {hasCircle
                  ? pointsInChart.map((it, index) => {
                      if (!activeCircle || (activeCircle && index === this.state.index)) {
                        return (
                          <react_native_svg_1.Circle
                            key={index}
                            cx={it.x}
                            cy={it.y}
                            r={circleRadius}
                            strokeWidth={width}
                            fill="white"
                            stroke={lineColor}
                          />
                        );
                      }
                      return null;
                    })
                  : null}
                {tooltip && tooltip.show ? <react_native_svg_1.Use href="#flag" /> : null}
                {!isLine && dashLine && dashLine.show && (
                  <react_native_svg_1.Use href="#dashline" />
                )}
              </react_native_svg_1.G>
            </react_native_svg_1.default>
            {customDashLine ? customDashLine.showText : null}
          </react_native_1.View>
          {tooltip && tooltip.show ? (
            <tooltip_1.default
              title={title && typeof title.title === 'string' ? title.title : ''}
              {...tooltip}
              background={lineColor}
              chartWidth={FullChartWidth}
              chartHeight={this.chartHeight}
              right={right}
              yPoint={dataSource[this.state.index]}
              xPoint={xData && xData.length > 0 ? xData[this.state.index] : undefined}
              distance={Distance}
            />
          ) : null}
          {xData && xData.length > 0 ? <xAxis_1.default step={step} xData={xData} /> : null}
          {title ? <title_1.default {...title} textColor={lineColor} /> : null}
        </react_native_1.View>
      </react_native_1.View>
    );
  }
}
LineChart.defaultProps = {
  line: {
    width: 2,
    color: '#49BBFF',
    dotRadius: 3,
  },
  tooltip: {
    show: true,
  },
  dashLine: {
    color: '#d0d0d0',
    show: true,
    dashLineConfig: [{ type: 'max' }, { type: 'min' }],
  },
  hasCircle: false,
  hasShadow: false,
  activeCircle: false,
};
exports.default = LineChart;
const styles = react_native_1.StyleSheet.create({
  container: {},
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerLine: {
    width: 1,
    height: ChartHeight,
    backgroundColor: '#EEEEEE',
  },
});
