import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { Utils } from 'tuya-panel-kit';
import dpCodes from '../../config/dpCodes';
import TYSdk from '../../api';
import Strings from '../../i18n';
import { store } from '../../redux/configureStore';

const {
  width: DEVICE_WIDTH,
  convertX: cx,
  // convertY: cy,
} = Utils.RatioUtils;

const { scaleNumber } = Utils.NumberUtils;

const { pm25: pm25Code } = dpCodes;

const outer = [50, 50, 50, 50, 50];
const inner = [85, 85, 85, 85, 85];
const gap = parseInt(DEVICE_WIDTH / 4.0, 10) - 4;

class HomeCurveView extends Component {
  static propTypes = {
    hideOutdoorPM25: PropTypes.bool,
    indoorPM25: PropTypes.number,
    outdoorPM25: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  static defaultProps = {
    hideOutdoorPM25: false,
    indoorPM25: 0,
    outdoorPM25: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      outers: this.calculatePathData(outer, 60), // 比50多10，室外曲线从10开始，避免出现曲线超出svg可视范围的情况
      inners: this.calculatePathData(inner, 95), // 比50多45，室内曲线位置从45
      realInner: 0, // 比50多45，室内曲线位置从45
    };
  }

  componentDidMount() {
    const pm25DpId = TYSdk.device.getDpIdByCode(pm25Code);
    TYSdk.getPm25HistoryCurve(pm25DpId)
      .then(data => {
        const d1 = this.ensurePM25Data(data.outer);
        const d2 = this.ensurePM25Data(data.inner);
        const outers = this.calculatePathData(d1, 60);
        const inners = this.calculatePathData(d2, 95);
        const { devInfo = {} } = store.getState();
        const { scale = 0 } = devInfo.schema[pm25Code];
        this.setState({ loaded: true, outers, inners, realInner: scaleNumber(scale, d2[0]) });
      })
      .catch(err => {
        this.setState({ loaded: true });
        console.warn('getPm25HistoryCurve Error: ', err);
      });
  }

  getPM25Value() {
    if (!pm25Code) {
      return '--';
    }
    const { indoorPM25 } = this.props;
    const { devInfo = {} } = store.getState();
    const { scale = 0 } = devInfo.schema[pm25Code];
    return scaleNumber(scale, indoorPM25);
  }

  ensurePM25Data(data) {
    return data.map(d => d || 0);
  }

  calculatePathData(data = [], maxY) {
    const max = Math.max(...data);
    const thresholds = [100, 200, 300, 400, 500];
    const ratio = (thresholds.find(v => max < v) || 500) / 50; // 范围[2, 4, 6, 8, 10]
    const pathData = data.map(v => maxY - v / ratio).reverse();
    return pathData;
  }

  calculatePath(data) {
    return data.reduce(
      (acc, cur, idx) => (idx === 0 ? `M0 ${cur} S` : `${acc} ${gap * idx} ${cur}`),
      ''
    );
  }

  renderDatesView() {
    const dates = [
      moment().subtract(4, 'days').format('MM.DD'),
      moment().subtract(3, 'days').format('MM.DD'),
      moment().subtract(2, 'days').format('MM.DD'),
      Strings.getLang('yesterday'),
      Strings.getLang('today'),
    ];

    return (
      <View style={styles.datesView}>
        {dates.map(v => (
          <Text key={v} style={styles.text}>
            {v}
          </Text>
        ))}
      </View>
    );
  }

  render() {
    const { hideOutdoorPM25 } = this.props;
    const { outdoorPM25 } = this.props;
    const { outers, inners, realInner, loaded } = this.state;
    const disOuter = [60.5, 60.5, 60.5, 60.5, 60.5];
    // 当接口拉取不到室外PM25数据的时候，会显示[-1,-1,-1,-1,-1];此时状态里的outers经处理后为[60.5, 60.5, 60.5, 60.5, 60.5]
    const showOuterPM25 = JSON.stringify(outers.sort()) !== JSON.stringify(disOuter.sort());
    const x = (gap * 4).toString();
    const outerY = outers[outers.length - 1].toString();
    const innerY = inners[outers.length - 1].toString();
    const outerPath = this.calculatePath(outers);
    const innerPath = this.calculatePath(inners);
    return (
      <View>
        <Svg height="150" width={DEVICE_WIDTH.toString()}>
          {showOuterPM25 && !hideOutdoorPM25 && (
            <G height={100}>
              <Path
                d={outerPath}
                fill="none"
                stroke="rgba(255,255,255,.5)"
                strokeDasharray="4, 2"
              />
              <Circle cx={x} cy={outerY} r="3" fill="rgba(255,255,255,.5)" />
              {loaded && (
                <SvgText
                  fill="#fff"
                  stroke="none"
                  fontSize="10"
                  x={x}
                  y={`${+outerY + 2}`}
                  textAnchor="end"
                >
                  {Strings.formatValue('outdoorPM25Tip', outdoorPM25)}
                </SvgText>
              )}
            </G>
          )}

          <G>
            <Path d={innerPath} fill="none" stroke="rgba(255,255,255,.5)" />
            <Circle cx={x} cy={innerY} r="3" fill="rgba(255,255,255,.5)" />
            {loaded && (
              <SvgText
                fill="#fff"
                stroke="none"
                fontSize="10"
                x={x}
                y={(innerY - outerY > 16 ? +innerY + 2 : +outerY + 16).toString()} // 避免室内室外文案重合
                textAnchor="end"
              >
                {Strings.formatValue('indoorPM25Tip', realInner)}
              </SvgText>
            )}
          </G>
        </Svg>
        {this.renderDatesView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  datesView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: cx(10),
    backgroundColor: 'transparent',
  },

  text: {
    color: '#fff',
    fontSize: Math.max(10, cx(10)),
  },
});

export default connect(({ dpState, outState }) => {
  const { outdoorState } = outState;
  return {
    indoorPM25: dpState[pm25Code],
    outdoorPM25: outdoorState.pm25,
  };
})(HomeCurveView);
