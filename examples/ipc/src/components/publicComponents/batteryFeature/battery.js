/* eslint-disable max-len */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, ColorPropType } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import Config from '../../../config';

const { cx } = Config;

const wrapBatteryD =
  'M6.5,0 C6.77614237,-5.07265313e-17 7,0.223857625 7,0.5 L7,1 L9.5,1 C10.3284271,1 11,1.67157288 11,2.5 L11,17.5 C11,18.3284271 10.3284271,19 9.5,19 L1.5,19 C0.671572875,19 0,18.3284271 0,17.5 L0,2.5 C0,1.67157288 0.671572875,1 1.5,1 L4,1 L4,0.5 C4,0.223857625 4.22385763,5.07265313e-17 4.5,0 L6.5,0 Z M9.5,2 L1.5,2 C1.22385763,2 1,2.22385763 1,2.5 L1,17.5 C1,17.7761424 1.22385763,18 1.5,18 L9.5,18 C9.77614237,18 10,17.7761424 10,17.5 L10,2.5 C10,2.22385763 9.77614237,2 9.5,2 Z';

export default class Battery extends PureComponent {
  static propTypes = {
    size: PropTypes.number,
    batteryColor: ColorPropType,
    value: PropTypes.number,
    highColor: ColorPropType,
    middleColor: ColorPropType,
    lowColor: ColorPropType,
    onCalcColor: PropTypes.func,
    isCharging: PropTypes.bool,
  };

  static defaultProps = {
    size: cx(10),
    batteryColor: 'rgba(0,0,0,.5)',
    value: 80,
    highColor: '#61d914',
    middleColor: '#e38315',
    lowColor: '#d11d14',
    onCalcColor: undefined,
    isCharging: false,
  };

  calcBattery = () => {
    const { value } = this.props;
    // 电池为100%, top: 3,电量20%: 14.2 ,电量10%: 15.6,电量为0%，top: 17
    const top = 17 - ((17 - 3) * value) / 100;
    return top;
  };

  calcColor = () => {
    const { highColor, middleColor, lowColor, onCalcColor } = this.props;
    const top = this.calcBattery();
    // 自定义电量的颜色分配规则
    const color =
      typeof onCalcColor === 'function' && onCalcColor(top, highColor, middleColor, lowColor);
    if (color) {
      return color;
    }
    if (top <= 14.2 && top >= 3) {
      return highColor;
    } else if (top <= 15.6 && top > 14.2) {
      return middleColor;
    }
    return lowColor;
  };
  render() {
    const { batteryColor, size, isCharging } = this.props;
    const top = this.calcBattery();
    // 左上、右上、右下、左下
    const points = `2 ${top} 9 ${top} 9 17 2 17`;
    const insideColor = this.calcColor();
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={1.1 * size} height={1.9 * size} viewBox="0 0 11 19">
          <Path d={wrapBatteryD} fill={batteryColor} />
          <Polygon points={points} fill={insideColor} />
          {isCharging && (
            <Path
              d="M3.2 0L0 5h1.6L.8 9 4 4H2.4z"
              fill="#FFF"
              fillRule="evenodd"
              x={0.26 * size}
              y={0.42 * size}
            />
          )}
        </Svg>
      </View>
    );
  }
}
