import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { Svg, Path, G, Circle } from 'react-native-svg';
import { Utils, TYText } from 'tuya-panel-kit';
import _padStart from 'lodash/padStart';

const { convertX: cx } = Utils.RatioUtils;

const defaultProps = {
  size: cx(255),
  lineWidth: 1,
  lineNum: 72,
  lineHeight: cx(10),
  countdown: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReset() {},
  resetText: 'Reset',
  totalCountDown: 0,
  showDot: true,
  innerBackgroundColor: 'transparent',
  activeColor: '#fff',
  lineColor: 'rgba(255,255,255, 0.4)',
};

type IProps = {
  timeTextStyle?: TextStyle | TextStyle[];
  resetTextStyle?: TextStyle | TextStyle[];
  resetStyle?: any;
  timeStyle?: any;
  hourLabel?: string;
  minuteLabel?: string;
  labelTextStyle?: TextStyle | TextStyle[];
} & Readonly<typeof defaultProps>;

export default class Countdown extends Component<IProps> {
  // eslint-disable-next-line
  static defaultProps = defaultProps;

  private angle = 0;

  private lines: number[] = [];

  constructor(props: IProps) {
    super(props);
    const { lineNum } = this.props;
    this.angle = (Math.PI * 2) / lineNum;
    this.lines = new Array(lineNum).fill(1);
  }

  shouldComponentUpdate(nextProps: IProps) {
    const { countdown } = this.props;
    return nextProps.countdown !== countdown;
  }

  getPoint(angle: number, radius: number) {
    const x = radius * Math.sin(angle);
    const y = -radius * Math.cos(angle);
    return { x, y };
  }

  getPath(angle: number) {
    const { size, lineHeight } = this.props;
    const radius = size / 2;
    const p1 = this.getPoint(angle, radius);
    const p2 = this.getPoint(angle, radius - lineHeight);

    return `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`;
  }

  getCircle() {
    const { size, lineHeight } = this.props;
    const innerRadius = size / 2 - lineHeight - 5;
    return this.lines
      .map((x, i) => {
        const p = this.getPoint(this.angle * i, innerRadius);
        return `M${p.x} ${p.y}`;
      })
      .join('');
  }

  render() {
    const {
      size,
      onReset,
      countdown,
      totalCountDown,
      lineHeight,
      lineWidth,
      resetText,
      lineNum,
      lineColor,
      activeColor,
      timeTextStyle,
      resetTextStyle,
      resetStyle,
      innerBackgroundColor,
      showDot,
      timeStyle,
      hourLabel,
      minuteLabel,
      labelTextStyle,
    } = this.props;
    const hours = Math.floor(countdown / 60);
    const minutes = countdown % 60;
    const formatHour = _padStart(`${hours}`, 2, '0');
    const formatMinute = _padStart(`${minutes}`, 2, '0');
    const radius = size / 2;
    const innerRadius = radius - lineHeight - (showDot ? 5 : 3);
    const dashWidth = (innerRadius * 2 * Math.PI) / lineNum - lineWidth;
    let total = totalCountDown;
    if (countdown > totalCountDown) {
      total = countdown;
    }
    const percent = countdown / total;
    let dashProps = {};
    if (showDot) {
      dashProps = {
        strokeDashoffset: 0,
        strokeDasharray: [lineWidth, dashWidth],
      };
    }
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G x={radius} y={radius}>
            {this.lines.map((x, i) => {
              const color = (i + 1) / lineNum <= percent ? activeColor : lineColor;
              return (
                <Path
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  d={this.getPath(this.angle * i)}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={lineWidth}
                />
              );
            })}
            <Circle
              cx={0}
              cy={0}
              r={innerRadius}
              fill={innerBackgroundColor}
              stroke={showDot ? lineColor : 'transparent'}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              {...dashProps}
            />
          </G>
        </Svg>
        <View style={[styles.textBox, timeStyle]}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
            <TYText style={[styles.time, timeTextStyle]}>{formatHour}</TYText>
            <TYText style={[styles.timeLabel, labelTextStyle]}>{hourLabel}</TYText>
            <TYText style={[styles.time, timeTextStyle]}>{formatMinute}</TYText>
            <TYText style={[styles.timeLabel, labelTextStyle]}>{minuteLabel}</TYText>
          </View>
          <TouchableOpacity
            style={[styles.reset, resetStyle]}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <TYText style={[styles.resetText, resetTextStyle]}>{resetText}</TYText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textBox: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 40,
  },
  timeLabel: {
    fontSize: 16,
    paddingBottom: 10,
  },
  reset: {
    width: '100%',
    marginTop: 4,
  },
  resetText: {
    width: '100%',
    fontSize: 12,
    textAlign: 'center',
  },
});
