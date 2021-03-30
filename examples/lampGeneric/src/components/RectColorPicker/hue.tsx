import React, { Component } from 'react';
import { View } from 'react-native';
import Svg, { LinearGradient, Defs, Stop, Rect } from 'react-native-svg';
import { Utils } from 'tuya-panel-kit';

const { convert } = Utils.RatioUtils;

const colorStops = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'];
const whiteStops = ['rgb(255, 162, 71)', '#fff', 'rgb(213, 225, 255)'];

interface HueProps {
  width: number;
  height: number;
  // 是否适配手机屏幕
  scalable: boolean;
  saturation: '2l' | '2r' | '2b' | '2t' | 'none';
  kelvin: boolean;
  axis: 'x' | 'y';
  hueBorderRadius: number;
  stops: any[]; // 自定义滚动条颜色
}

export default class Hue extends Component<HueProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    width: 100,
    height: 50,
    scalable: false,
    axis: 'x',
    kelvin: false,
    saturation: 'none',
    hueBorderRadius: 0,
    stops: null,
  };

  shouldComponentUpdate(nextProps: HueProps) {
    const { props } = this;

    return (
      props.width !== nextProps.width ||
      props.height !== nextProps.height ||
      props.scalable !== nextProps.scalable ||
      props.kelvin !== nextProps.kelvin ||
      props.saturation !== nextProps.saturation
    );
  }

  get stops() {
    const { stops, kelvin } = this.props;
    if (stops) {
      return stops;
    }
    const colorP = [...colorStops];
    return kelvin ? whiteStops : colorP;
  }

  render() {
    let { width, height } = this.props;
    const { scalable, saturation, axis, kelvin, hueBorderRadius } = this.props;

    if (scalable) {
      width = convert(width);
      height = convert(height);
    }

    const horizontal = axis === 'x';

    const saturationProps = horizontal
      ? { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
      : { x1: '0%', y1: '0%', x2: '100%', y2: '0%' };

    const hueProps = horizontal
      ? { x1: '0%', y1: '0%', x2: '100%', y2: '0%' }
      : { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };

    const { stops } = this;
    const stopStep = 100 / (stops.length - 1);
    return (
      <View style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="hue" {...hueProps}>
              {stops.map((point, i) => {
                const key = `${point}${i}`;
                return (
                  <Stop
                    key={key}
                    offset={`${kelvin && i === 1 ? 60 : stopStep * i}%`}
                    stopColor={point}
                  />
                );
              })}
            </LinearGradient>

            <LinearGradient id="saturation" {...saturationProps}>
              <Stop
                offset="0%"
                stopColor="#fff"
                stopOpacity={saturation === '2b' || saturation === '2r' ? 0 : 1}
              />
              <Stop
                offset="100%"
                stopColor="#fff"
                stopOpacity={saturation === '2b' || saturation === '2r' ? 1 : 0}
              />
            </LinearGradient>
          </Defs>

          <Rect x="0" y="0" rx={hueBorderRadius} width="100%" height="100%" fill="url(#hue)" />

          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={hueBorderRadius}
            fill={saturation && saturation !== 'none' ? 'url(#saturation)' : 'none'}
          />
        </Svg>
      </View>
    );
  }
}
