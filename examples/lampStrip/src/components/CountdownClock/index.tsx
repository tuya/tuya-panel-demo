/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/require-default-props */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import { Svg, Path, G, Circle } from 'react-native-svg';
import { Utils, TYText } from 'tuya-panel-kit';
import _padStart from 'lodash/padStart';
import color from 'color';
import Strings from './i18n';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const HourLabel = Strings.getLang('countdown_clock_hour');
const MinuteLabel = Strings.getLang('countdown_clock_minute');
const SecondLabel = Strings.getLang('countdown_clock_second');
const ResetText = Strings.getLang('countdown_clock_reset');

const defaultProps = {
  style: {},
  timeTextStyle: {},

  resetStyle: {},
  timeStyle: {},
  size: cx(255),
  lineNum: 72,
  lineHeight: cx(10),
  countdown: 0,
  totalCountDown: 0,
  showDot: true,
  innerBackgroundColor: 'transparent',
  labelTextStyle: {},
  lineWidth: 1,
};

type IProps = {
  style?: any;
  timeTextStyle?: TextStyle | TextStyle[];
  resetTextStyle?: TextStyle | TextStyle[];
  resetStyle?: ViewStyle | ViewStyle[];
  timeStyle?: ViewStyle | ViewStyle[];
  labelTextStyle?: TextStyle | TextStyle[];
  lineColor: string;
  size?: number;
  lineWidth?: number;
  lineNum?: number;
  lineHeight?: number;
  countdown?: number;
  totalCountDown?: number;
  showDot?: boolean;
  innerBackgroundColor?: string;
  onReset: () => void;
  theme?: any;
} & Readonly<typeof defaultProps>;

class CountdownClock extends Component<IProps> {
  // eslint-disable-next-line react/static-property-placement
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
    return nextProps.countdown !== this.props.countdown;
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
      global: { fontColor, isDarkTheme },
    } = this.props.theme;
    console.log('fontColor', this.props.theme);
    const {
      size,
      onReset,
      countdown,
      totalCountDown,
      lineHeight,
      lineWidth,
      lineNum,
      lineColor = isDarkTheme ? 'rgba(255,255,255, 0.4)' : 'rgba(0,0,0,0.4)',
      timeTextStyle,
      resetTextStyle,
      resetStyle,
      innerBackgroundColor,
      showDot,
      timeStyle,
      labelTextStyle,
      style,
    } = this.props;
    const activeColor = fontColor;
    const hours = parseInt(`${countdown / 3600}`, 10);
    const minutes = parseInt(`${countdown / 60 - hours * 60}`, 10);
    const seconds = parseInt(`${countdown - hours * 3600 - minutes * 60}`, 10);
    const formatHour = _padStart(`${hours}`, 2, '0');
    const formatMinute = _padStart(`${minutes}`, 2, '0');
    const formatSecond = _padStart(`${seconds}`, 2, '0');
    // const hours = Math.floor(countdown / 60);
    // const minutes = countdown % 60;
    // const formatHour = _padStart(`${hours}`, 2, '0');
    // const formatMinute = _padStart(`${minutes}`, 2, '0');
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
      <View
        style={[
          { width: size, height: size, justifyContent: 'center', alignItems: 'center' },
          style,
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G x={radius} y={radius}>
            {this.lines.map((x, i) => {
              const color = (i + 1) / lineNum <= percent ? activeColor : lineColor;
              return (
                <Path
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
            <TYText
              style={[
                styles.time,
                timeTextStyle,
                {
                  color: fontColor,
                },
              ]}
            >
              {formatHour}
            </TYText>
            <TYText style={[styles.timeLabel, labelTextStyle]}>{HourLabel}</TYText>
            <TYText
              style={[
                styles.time,
                timeTextStyle,
                {
                  color: fontColor,
                },
              ]}
            >
              {formatMinute}
            </TYText>
            <TYText style={[styles.timeLabel, labelTextStyle]}>{MinuteLabel}</TYText>
            <TYText
              style={[
                styles.time,
                timeTextStyle,
                {
                  color: fontColor,
                },
              ]}
            >
              {formatSecond}
            </TYText>
            <TYText style={[styles.timeLabel, labelTextStyle]}>{SecondLabel}</TYText>
          </View>
          <TouchableOpacity
            style={[styles.reset, resetStyle]}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <TYText
              style={[
                styles.resetText,
                resetTextStyle,
                {
                  // @ts-ignore
                  color: color(fontColor).alpha(0.7).rgbaString(),
                },
              ]}
            >
              {ResetText}
            </TYText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default withTheme(CountdownClock);

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
    width: cx(56),
    fontSize: cx(42),
    textAlign: 'right',
  },
  timeLabel: {
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
